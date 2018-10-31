import * as FS from "fs-extra"
import { flatten } from 'lodash'

export default function build( from: string, to: string, rootFunctionName: string ) {
  const json = FS.readJSONSync( from )

  const filtered = json.filter( hasFunction ).map( getNodes )
  const flattenData = flatten( filtered )
  const res = generateTree( rootFunctionName, flattenData )

  FS.outputJsonSync( to, res )

  function hasFunction( item ) { 
    try {
      return item.args.data.cpuProfile.nodes.length > 0 
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

  function generateTree( rootFunctionName, nodes ) {
    const rootFunctionId = getFuncIdByName( rootFunctionName, nodes )

    const name = getFuncNameById( rootFunctionId, nodes )
    const children = getChildren( rootFunctionId )
    let res = { name, children  }
     return res

    function getChildren( id ) {
      const childrenIds = nodes.filter( ( { parent: parentId } ) => parentId === id ).map( ( { id } ) => id )
      return childrenIds.map( childId => ( {
        name    : getFuncNameById( childId, nodes ),
        children: getChildren( childId )
      } ) )
    }
  }

  function getFuncIdByName( name, nodes ) {
    const filtered = nodes.filter( ( { functionName } ) => functionName === name )
    return filtered[ 0 ].id
  }

  function getFuncNameById( theId, nodes ) {
    const filtered = nodes.filter( ( { id } ) => id === theId )
    return filtered[ 0 ].functionName
  }
}

