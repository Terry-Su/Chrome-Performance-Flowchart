import * as FS from "fs-extra"
import { cloneDeep } from "lodash"

export default function( data, output ) {
  let codes = []

  let uniqueId = 0

  const cloned = cloneDeep( data )

  recurToAddId( cloned )
  recurToAddCode( cloned )

  const string =  codes.join( '\n' )
  FS.writeFileSync( output, string )


  function recurToAddId( cloned ) {
    const { id, children } = cloned
    cloned.id = getUniqueId()
    cloned.children.map( recurToAddId )
  }

  function recurToAddCode( data ) {
    let { name, children, id } = data
    name = name.trim() === '' ? '__Empty__' : name

    children.map( item => {
      let { name: subName, id: subId } = item
      subName = subName.trim() === '' ? '__Empty__' : subName
      const formated = formatCode( `${ id }(${ name })`, `${ subId }(${ subName })` )
      codes.push( formated )
    } )

    children.map( recurToAddCode )
  }

  function formatCode( a, b ) {
    a = a.trim() === '' ? '__Empty__' : a
    b = b.trim() === '' ? '__Empty__' : b
    return `${ a }-->${ b }`
  }

  function getUniqueId() {
    uniqueId = uniqueId + 1
    return uniqueId
  }
}
