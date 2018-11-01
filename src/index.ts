import * as FS from "fs-extra"
import { flatten, findIndex, cloneDeep } from "lodash"
import IDTree, { createIDTree } from "./IdTree"
import Chain from "./Chain"
import IDTreeStructure, { createIDTreeStructure } from "./IDTreeStructure"

export default function build(
  from: string,
  to: string,
  rootFunctionName: string
) {
  const json = FS.readJSONSync( from )

  const filtered = json.filter( hasScriptId ).map( getNodes )
  const allNodes = flatten( filtered )

  const node = getNodeByFunctionName( rootFunctionName, allNodes )
  const { id: rootId } = node
  const idTree = getIDTree( allNodes, rootId )
  const { json: isTreeJSON } = idTree

  const tree = getJSONTree( isTreeJSON, allNodes )

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
      const { functionName } = callFrame
      return { functionName, id, parent }
    }
  }
}

export function getIDTree( allNodes, rootId: number ) {
  const targetNodeIndex = findIndex( allNodes, ( { id }: any ) => id === rootId )
  const filtered = allNodes.filter( ( section, index ) => index >= targetNodeIndex )
  const nodes = flatten( filtered )

  const allNodesStructure = getIDTreeStructure( allNodes, rootId )

  let res = createIDTree( rootId, null )

  nodes.forEach( resolve )

  function resolve( node ) {
    const { id, parent: parentId } = node

    const chain = res.getMostBottomRightChain()

    const foundNode = chain.getNodeById( parentId )

    if ( foundNode != null ) {
      const child = createIDTree( id, null )
      foundNode.addChild( child )
    }

    if ( foundNode == null ) {
      addMostBottomRightNodes( chain, parentId, id )
    }

    function addMostBottomRightNodes(
      chain: Chain,
      parentId: number,
      id: number
    ) {
      let ids = [ id, parentId ]
      let potentialParentId = parentId

      recur()
      function recur() {
        potentialParentId = allNodesStructure.getParentIdById( potentialParentId )
        if ( potentialParentId != null ) {
          const node = chain.getNodeById( potentialParentId )

          if ( node == null ) {
            ids.push( potentialParentId )
            recur()
          }

          if ( node != null ) {
            const idTree = createIDTreeByIds( ids )
            node.addChild( idTree )
          }
        }
      }

      function createIDTreeByIds( ids ) {
        let topIDTree: IDTree
        ids.forEach( ( id, index ) => {
          const child = topIDTree
          topIDTree = createIDTree( id, null )
          child != null && topIDTree.addChild( child )
        } )
        return topIDTree
      }
    }
  }

  return res
}

function getIDTreeStructure( allNodes, rootId: number ): IDTreeStructure {
  let res: IDTreeStructure = recurToCreate( allNodes, rootId )
  return res

  function recurToCreate( allNodes, id: number ): IDTreeStructure {
    let res: IDTreeStructure = createIDTreeStructure( id, null )

    const childrenIds = allNodes
      .filter( ( { parent: parentId } ) => parentId === id )
      .map( ( { id } ) => id )
    const children = childrenIds.map( childId =>
      recurToCreate( allNodes, childId )
    )

    children.forEach( child => res.addChild( child ) )

    return res
  }
}

export function getMostBottomRightIDTreeAsSameLevel(
  rootTree: IDTree,
  id
): IDTree {
  let res = null
  recurToGet( rootTree, id )
  return res

  function recurToGet( tree: IDTree, id ) {
    const matchedTree = getMatchedTree( tree, id )
    if ( matchedTree != null ) {
      res = matchedTree
    } else {
      tree.children.forEach( child => recurToGet( child, id ) )
    }
  }

  function getMatchedTree( tree, id ) {
    if ( tree.id === id ) {
      // If there's a tree on the right of this tree, then return that tree
      let target = getMostRightTree( rootTree, tree ) || tree
      return target
    }

    function getMostRightTree( rootTree: IDTree, tree: IDTree ) {
      let res = tree
      recurToSet( rootTree, tree )
      return res

      function recurToSet( tree: IDTree, thisTree: IDTree ) {
        const { children } = tree

        if ( children.includes( thisTree ) ) {
          res = children[ children.length - 1 ]
        } else {
          children.forEach( child => recurToSet( child, thisTree ) )
        }
      }
    }
  }
}

function getJSONTree( idTree: IDTree, allNodes ) {
  let cloned = cloneDeep( idTree )
  recurToUpdateTree( cloned )
  return cloned

  function recurToUpdateTree( idTree ) {
    const { id } = idTree
    const name = getFunctionName( id, allNodes )

    idTree[ "name" ] = name
    delete idTree[ "id" ]

    const cachedChildren = idTree.children
    delete idTree[ "children" ]
    idTree[ "children" ] = cachedChildren

    const { children } = idTree
    children.forEach( recurToUpdateTree )
  }
}

function createParentIDTree( parentId, id ): IDTree {
  const parent = createIDTree( parentId, null )
  const child = createIDTree( id, null )
  parent.addChild( child )
  return parent
}
function getFunctionName( id, nodes ) {
  const node = getNodeByFunctionId( id, nodes )
  return node.functionName
}

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
