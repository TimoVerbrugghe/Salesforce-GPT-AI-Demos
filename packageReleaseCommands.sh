## Create a new package
sfdx package create --name einsteinGPTDemosAdvanced --description "EinsteinGPT Demo Components for Advanced and Visionary Demos. Several demo components that connect to OpenAI's GPT models." --package-type Unlocked --no-namespace --target-dev-hub aiDemos --path force-app

## Create a version of the package
sfdx package version create --package 0Ho7R000000TNIVSA4 --installation-key-bypass --wait 10 --code-coverage


## Release the package
sfdx package version promote --package 04t7R0000018qdpQAA