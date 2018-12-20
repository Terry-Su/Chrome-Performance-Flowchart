import * as FS from "fs-extra"
import getFlowchartCodes from "./getFlowchartCodes"

export default function( data, output ) {
  const codes = getFlowchartCodes( data )
  FS.writeFileSync( output, codes )
}
