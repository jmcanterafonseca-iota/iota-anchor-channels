import { IotaAnchoringChannel, SeedHelper } from "@tangle.js/anchors";
import { Arguments } from "yargs";
import { isDefined } from "../../globalParams";
import { getNetworkParams } from "../commonParams";

export default class CreateChannelCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const node = getNetworkParams(args).network;

    try {
      let seed = "";

      if (!isDefined(args, "seed")) {
        seed = SeedHelper.generateSeed(25);
      } else {
        seed = args.seed as string;
      }

      const channelDetails = await IotaAnchoringChannel.create(seed, { node });
      console.log(channelDetails);
    } catch (error) {
      console.error("Error:", error);
      return false;
    }

    return true;
  }
}