name := """slugg"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala).settings(
  JsEngineKeys.engineType := JsEngineKeys.EngineType.Node
)

scalaVersion := "2.11.1"

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache,
  ws
)

sassOptions in Assets ++= Seq("--compass", "-r", "compass")

herokuAppName in Compile := "slugg"