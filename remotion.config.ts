import { Config } from "@remotion/cli/config";
Config.setVideoImageFormat("png");
Config.setOverwriteOutput(true);

// WebGL2 for brief zoom/directional blur effects.
Config.setChromiumOpenGlRenderer("swangle");
