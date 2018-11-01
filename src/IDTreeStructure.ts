export default class IDTreeStructure {
  id: number
  children: IDTreeStructure[] = []
  parent: IDTreeStructure

  constructor( id: number, children?: IDTreeStructure[] ) {
    this.id = id
    this.children = Array.isArray( children ) ? children : []
  }

  getJson(): any {
    const { id, children: treeChildren } = this
    const children = treeChildren.map( tree => tree.getJson() )
    const res = {
      id,
      children
    }
    return res
  }

  addChild( node: IDTreeStructure ) {
    node.setParent( this )
    this.children.push( node )
  }

  setParent( parent: IDTreeStructure ) {
    this.parent = parent
  }

  getNodeById( id: number ) {
    let res: IDTreeStructure
    recuToGet( this )

    function recuToGet( node: IDTreeStructure ) {
      if ( node.id === id ) {
        res = node
      } else {
        node.children.forEach( recuToGet )
      }
    }

    return res
  }

  getParentIdById( id: number ) {
    const node = this.getNodeById( id )
    if ( node && node.parent ) {
      return node.parent.id
    }
  }
}

export function createIDTreeStructure( id: number, children?: IDTreeStructure[] ) {
  return new IDTreeStructure( id, children )
}