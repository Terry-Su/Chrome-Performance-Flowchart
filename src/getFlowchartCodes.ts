const ANOYMOUS = "__anoymous__"
export default function( basic: any ) {
  let codes = []
  let uniqueId = 0

  recurToAddId( basic )
  recurToAddCode( basic )

  return codes.join( "\n" )

  function recurToAddId( basic ) {
    basic.id = getUniqueId()
    basic.children.map( recurToAddId )
  }

  function recurToAddCode( data ) {
    let { name, children, id } = data
    name = name.trim() === "" ? ANOYMOUS : name

    children.map( item => {
      let { name: subName, id: subId } = item
      subName = subName.trim() === "" ? ANOYMOUS : subName
      const formated = formatCode( `${id}(${name})`, `${subId}(${subName})` )
      codes.push( formated )
    } )

    children.map( recurToAddCode )
  }

  function formatCode( a, b ) {
    a = a.trim() === "" ? ANOYMOUS : a
    b = b.trim() === "" ? ANOYMOUS : b
    return `${a}-->${b}`
  }

  function getUniqueId() {
    uniqueId = uniqueId + 1
    return uniqueId
  }
}
