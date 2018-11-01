import IDTree from "./IdTree"



/**
 *          1
 *        0   1
 *      0     0  1
 *          0       1
 * 
 * A chain is a line(multiple line) from a top node to a bottom node(for example: "1" patterns above)
 */
export default class Chain {
  nodes: IDTree[] = []

  constructor( nodes: IDTree[] ) {
    this.nodes = nodes
  }

  prev( node: IDTree ) {
    const index = this.nodes.indexOf( node )
    return index > 0 ? this.nodes[ index - 1 ] : null
  }

  next( node: IDTree ) {
    const index = this.nodes.indexOf( node )
    return index >= 0 && index < this.nodes.length - 1 ? this.nodes[ index + 1 ] : null
  }

  add( node: IDTree ) {
    this.nodes.push( node )
  } 

  getNodeById( id ) {
    return this.nodes.filter( node => node.id === id )[ 0 ]
  }

  exist( id ) {
    return this.getNodeById( id ) != null
  }
}

export function createChain( nodes: IDTree[] ) {
  return new Chain( nodes )
}