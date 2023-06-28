// Copyright 2020-2022 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import { ebsiDidsJwk as ebsiDids } from "../dids";
import { JWK, JWT, type JWKObject, type JWTPayload, type JWTSignOptions } from "ts-jose";
import { get } from "../../utilHttp";

import { Converter } from "@iota/util.js";

const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { PLUGIN_ENDPOINT, TOKEN } = process.env;

async function run() {
    if (!process.argv[2]) {
        console.error("Please provide a VC encoded as a JWT as a command line parameter");
        process.exit(-1);
    }
    // This is the Vc (as JWT) that has to be wrapped into the VP
    const vcAsJwt = process.argv[2];

    const jwtSegments = vcAsJwt.split(".");
    if (jwtSegments.length != 3) {
        console.error("Invalid VC JWT");
        process.exit(-1);
    }

    // The VC is parsed before being wrapped into a VP, just to obtain the subject
    const decoder = new TextDecoder();
    const jwtPayload = JSON.parse(decoder.decode(Converter.base64ToBytes(jwtSegments[1])));
    if (!jwtPayload["vc"]) {
        console.error("The JWT does not contain a VC");
        process.exit(-1);
    }
    const vcPayload = jwtPayload["vc"];

    const holder = ebsiDids.esGovernmentTAO;

    const holderDid = holder.did;

    const privateKey = await JWK.fromObject(holder.privateKeySign as unknown as JWKObject);
 
     const holderDocument = await get(`${PLUGIN_ENDPOINT}/identities/${encodeURIComponent(holderDid)}`, TOKEN);
     console.error("Resolved DID document:", JSON.stringify(holderDocument, null, 2));

    const verifiablePresentation = {
        id: "https://id.example.org/vp/456789",
        type: "VerifiablePresentation",
        holder: holderDid,
        verifiableCredential: [vcAsJwt]
    };


    const nonce = "4567789";
    const payload: JWTPayload = {
        vp: verifiablePresentation,
        nonce
    };

    const now = Math.floor(Date.now() / 1000);

    const options: JWTSignOptions = {
       issuer: holderDid,
       subject: vcPayload["credentialSubject"]["id"],
       jti: verifiablePresentation["id"],
       kid: `${holder.privateKeySign.kid}`,
       notBefore: now,
       iat: now,
       // Expires in 1 hour
       exp: now + 3600,
       audience: "https://dpp.registry.org"
    };

    let token = "";
    try {
        // Now the JWT Claims are defined
        token = await JWT.sign(payload, privateKey, options)
    }
    catch (error) {
        console.error(error);
        return;
    }
    
   console.log(token);

}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
