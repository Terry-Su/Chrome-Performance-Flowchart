import * as FS from "fs-extra"
import { flatten, findIndex, cloneDeep } from "lodash"

interface IDTree {
  id: number
  children: IDTree[]
}

interface Tree {
  name: string
  children: Tree[]
}

export default function build(
  from: string,
  to: string,
  rootFunctionName: string
) {
  const json = FS.readJSONSync( from )

  const filtered = json.filter( hasScriptId ).map( getNodes )
  const allNodes = flatten( filtered )
  const idTree = getIDTree( rootFunctionName, allNodes )
  const tree = getTree( idTree, allNodes )

  FS.outputJsonSync( to, tree )

  function hasScriptId( item ) {
    try {
      return (
        item.args.data.cpuProfile.nodes.filter(
          ( { callFrame } ) => callFrame.scriptId != null
        ).length > 0
      )
    } catch ( e ) {
      return false
    }
  }

  function getNodes( item ) {
    try {
      return item.args.data.cpuProfile.nodes.map( getItems )
    } catch ( e ) {
      console.log( e )
      return []
    }

    function getItems( node ) {
      const { callFrame = {}, id, parent } = node
      const { functionName, scriptId } = callFrame
      return { functionName, id, parent, scriptId }
    }
  }

  function getIDTree( rootFunctionName, allNodes ) {
    const node = getNodeByFunctionName( rootFunctionName, allNodes )
    const { id: rootId } = node

    const targetNodeIndex = findIndex( allNodes, ( { id }: any ) => id === rootId )
    const filtered = allNodes.filter(
      ( section, index ) => index >= targetNodeIndex
    )
    const nodes = flatten( filtered )

    let res: IDTree = {
      id      : rootId,
      children: []
    }

    nodes.forEach( resolve )

    function resolve( node ) {
      recurToUpdateTree( res, node )
    }

    function recurToUpdateTree( tree, node ) {
      const { id, parent: parentId } = node
      // const { id: treeId, children: treeChildren } = tree
      const targetTree = getMostBottomRightTree( tree, parentId )
      if ( targetTree ) {
        updateTree( targetTree, id, parentId )
      }
    }

    return res

    function updateTree( tree, id, parentId ) {
      const idTree = createIDTree( id )
      tree.children.push( idTree )
    }

    function getMostBottomRightTree( tree, id ) {
      // const { id: treeId, children: treeChildren } = tree
      // if ( treeId === id ) {
      //   return tree
      // }

      // const filteredChildren = treeChildren.filter( tree => getMostBottomRightTree( tree, id ) != null )
      // const potential = filteredChildren[ filteredChildren.length - 1 ]
      // return potential
      let res = null
      recurToGet( tree, id )
      return res
      function recurToGet( tree, id ) {
        const matchedTree = getMatchedTree( tree, id )
        if ( matchedTree != null ) {
          res = matchedTree
        } else {
          tree.children.forEach( child => recurToGet( child, id ) )
        }
      }

      function getMatchedTree( tree, id ) {
        if ( tree.id == id ) {
          return tree
        }
      }
    }

    function getMostBottomRightTreeAsSameLevel( tree, id ) {
      
    }

    function createIDTree( id ): IDTree {
      return {
        id,
        children: []
      }
    }

    function createParentIDTree( id, parentId ): IDTree {
      return {
        id      : parentId,
        children: [ createIDTree( id ) ]
      }
    }

   

    // const rootFunctionId = getFuncIdByName( rootFunctionName, nodes )

    // const name = getFuncNameById( rootFunctionId, nodes )
    // const scriptId = getScriptIdById( rootFunctionId, nodes )
    // const children = getChildren( rootFunctionId )
    // let res = { name, scriptId, children  }
    // return res

    // function getChildren( id ) {
    //   const childrenIds = nodes.filter( ( { parent: parentId } ) => parentId === id ).map( ( { id } ) => id )
    //   return childrenIds.map( childId => ( {
    //     name    : getFuncNameById( childId, nodes ),
    //     scriptId: getScriptIdById( rootFunctionId, nodes ),
    //     children: getChildren( childId )
    //   } ) )
    // }
  }

  function getTree( idTree: IDTree, allNodes ) {
    let cloned = cloneDeep( idTree )
    recurToUpdateTree( cloned )
    return cloned

    function recurToUpdateTree( idTree ) {
      const { id } = idTree
      const name = getFuncNameById( id, allNodes )

      idTree[ "name" ] = name
      delete idTree[ "id" ]

      const cachedChildren = idTree.children
      delete idTree[ "children" ]
      idTree[ 'children' ] = cachedChildren

      const { children } = idTree
      children.forEach( recurToUpdateTree )
    }
  }

  function getFuncNameById( theId, nodes ) {
    const node = getNodeByFunctionId( theId, nodes )
    return node.functionName
  }

  // function getScriptIdById( theId, nodes ) {
  //   const filtered = nodes.filter( ( { id } ) => id === theId )
  //   return filtered[ 0 ].scriptId
  // }

  function getFunctionIdByName( name, nodes ) {
    const filtered = nodes.filter( ( { functionName } ) => functionName === name )
    return filtered[ 0 ].id
  }

  function getNodeByFunctionId( functionId, allNodes ) {
    const filtered = allNodes.filter( ( { id } ) => id === functionId )
    return filtered[ 0 ]
  }

  function getNodeByFunctionName( functionName, allNodes ) {
    const functionId = getFunctionIdByName( functionName, allNodes )
    return getNodeByFunctionId( functionId, allNodes )
  }
}
