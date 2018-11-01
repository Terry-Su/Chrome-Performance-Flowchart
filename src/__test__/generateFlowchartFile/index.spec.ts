import generateFlowchartFile from "../../generateFlowchartFile"
import * as PATH from "path"

describe( "generateFlowchartFile", () => {
  // it( '', () => {

  // } )

  const output = PATH.resolve( __dirname, "output/data.svg" )
  generateFlowchartFile( "A-->B", output )
} )
