import generateFlowchartCodesFile from "../../generateFlowchartCodesFile"
import * as FS from "fs-extra"
import * as PATH from "path"

describe( "generateFlowchartCodesFile", () => {
  it( "", () => {
    const basic = FS.readJSONSync( PATH.resolve( __dirname, 'basic.json' ) )
    const output = PATH.resolve( __dirname, 'output/codes.txt' )
    generateFlowchartCodesFile( basic, output )
  } )
} )
