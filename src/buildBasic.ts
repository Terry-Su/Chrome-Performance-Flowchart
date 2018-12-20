import * as FS from "fs-extra"
import getBasic from "./getBasic"

export default function (
  from: string,
  to: string,
  rootFunctionName: string
) {
  const profileJson = FS.readJSONSync( from )

  const basicData = getBasic( profileJson, rootFunctionName )

  FS.outputJsonSync( to, basicData )
}
