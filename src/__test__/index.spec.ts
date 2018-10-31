import * as FS from "fs-extra"
import * as PATH from 'path'
import build from '..'
import generateFlowchartCodes from '../generateFlowchartCodes'


const from = PATH.resolve( __dirname, 'profile.json' )
const to = PATH.resolve( __dirname, 'output/result.json' )

build( from, to, 'legacyRenderSubtreeIntoContainer' )

const data = FS.readJSONSync( to )

const flowchartCodesOutput = PATH.resolve( __dirname, 'output/flowchartCodes.txt' )

const flowchartCodes = generateFlowchartCodes( data, flowchartCodesOutput )