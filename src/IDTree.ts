import Chain, { createChain } from "./Chain"

export default class IDTree {
  id: number
  children: IDTree[] = []

  parent: IDTree

  constructor( id: number, children: IDTree[] = [], parentIDTree?: IDTree ) {
    this.id = id
    this.children = Array.isArray( children ) ? children : []
    this.parent = parentIDTree
  }

  get parentChildren() {
    return this.parent ? this.parent.children : null
  }

  get json(): any {
    const { id, children: treeChildren } = this
    const children = treeChildren.map( tree => tree.json )
    const res = {
      id,
      children
    }
    return res
  }

  getMostBottomRightChain(): Chain {
    let res: Chain = createChain( [ this ] )

    recur( this )

    return res
    
    function recur( tree ) {
      const { children } = tree
      const last = children[ children.length - 1 ]
      if ( last ) {
        res.add( last )
        recur( last )
      }
    }
    
  }

  addChild( tree: IDTree ) {
    tree.setParent( this )
    this.children.push( tree )
  }

  setParent( parent: IDTree ) {
    this.parent = parent
  }
}

export function createIDTree( id: number, children: IDTree[], parentIDTree?: IDTree ): IDTree {
  return new IDTree( id, children, parentIDTree )
}