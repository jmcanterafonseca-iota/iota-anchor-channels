import { Subscriber } from "wasm-node/iota_streams_wasm";
import AnchorError from "./errors/anchorError";
import AnchorErrorNames from "./errors/anchorErrorNames";
import { ChannelHelper } from "./helpers/channelHelper";
import initialize from "./helpers/initializationHelper";
import { IAnchoringRequest } from "./models/IAnchoringRequest";
import { IAnchoringResult } from "./models/IAnchoringResult";
import { IBindChannelRequest } from "./models/IBindChannelRequest";
import { IFetchRequest } from "./models/IFetchRequest";
import { IFetchResult } from "./models/IFetchResult";
import AnchorMsgService from "./services/anchorMsgService";
import ChannelService from "./services/channelService";
import FetchMsgService from "./services/fetchMsgService";

// Needed for the Streams WASM bindings
initialize();

export class IotaAnchoringChannel {
    private _channelID: string;

    private readonly _node: string;

    private readonly _seed: string;

    private _channelAddress: string;

    private _announceMsgID: string;

    private _subscriber: Subscriber;

    private constructor(node: string, seed?: string) {
        this._node = node;
        this._seed = seed;

        if (!seed) {
            this._seed = ChannelHelper.generateSeed();
        }
    }

    /**
     * Creates a new Anchoring Channel
     *
     * @param node  The node
     * @param seed  The seed
     *
     * @returns The anchoring channel
     */
    public static create(node: string, seed?: string): IotaAnchoringChannel {
        return new IotaAnchoringChannel(node, seed);
    }

    /**
     * Binds to an existing channel or creates a new binding
     *
     * @param channelID in the form of 'channel_address:announce_msg_id'
     *
     * @returns reference to the channel
     *
     */
    public async bind(channelID?: string): Promise<IotaAnchoringChannel> {
        if (this._subscriber) {
            throw new AnchorError(AnchorErrorNames.CHANNEL_ALREADY_BOUND, `Channel already bound to ${this._channelID}`);
        }
        if (!channelID) {
            const { channelAddress, announceMsgID } = await ChannelService.createChannel(this._node, this._seed);
            this._channelAddress = channelAddress;
            this._announceMsgID = announceMsgID;
            this._channelID = `${channelAddress}:${announceMsgID}`;
        } else {
            const components: string[] = channelID.split(":");

            if (Array.isArray(components) && components.length === 2) {
                this._channelID = channelID;
                this._channelAddress = components[0];
                this._announceMsgID = components[1];
            } else {
                throw new AnchorError(AnchorErrorNames.CHANNEL_BINDING_ERROR,
                    `Invalid channel identifier: ${channelID}`);
            }
        }

        const bindRequest: IBindChannelRequest = {
            node: this._node,
            seed: this._seed,
            channelID: this._channelID
        };

        this._subscriber = await ChannelService.bindToChannel(bindRequest);

        return this;
    }

    public get channelID(): string {
        return this._channelID;
    }

    public get channelAddr(): string {
        return this._channelAddress;
    }

    public get firstAnchorageID(): string {
        return this._announceMsgID;
    }

    public get node(): string {
        return this._node;
    }

    public get seed(): string {
        return this._seed;
    }

    /**
     * Anchors a message to the anchoring channel
     *
     * @param message Message to be anchored
     * @param anchorageID The anchorage
     * @returns The result of the operation
     */
    public async anchor(message: string, anchorageID: string): Promise<IAnchoringResult> {
        if (!this._channelAddress) {
            throw new AnchorError(AnchorErrorNames.CHANNEL_NOT_BOUND,
                "Unbound anchoring channel. Please call bind first");
        }

        const request: IAnchoringRequest = {
            channelID: this._channelID,
            subscriber: this._subscriber,
            message,
            anchorageID
        };

        const result = await AnchorMsgService.anchor(request);

        return result;
    }

    /**
     * Fetch a previously anchored message
     *
     * @param anchorageID The anchorage point
     * @param messageID  The ID of the message
     *
     * @returns The fetch result
     */
    public async fetch(anchorageID: string, messageID?: string): Promise<IFetchResult> {
        if (!this._channelAddress) {
            throw new AnchorError(AnchorErrorNames.CHANNEL_NOT_BOUND,
                "Unbound anchoring channel. Please call bind first");
        }

        const request: IFetchRequest = {
            node: this._node,
            seed: this._seed,
            channelID: this._channelID,
            channelAddress: this._channelAddress,
            msgID: messageID,
            anchorageID
        };

        return FetchMsgService.fetch(request);
    }
}
