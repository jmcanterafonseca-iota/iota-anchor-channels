/* eslint-disable jsdoc/require-jsdoc */
import { ProofOptions, VerifierOptions } from "@iota/identity-wasm/web";
import { SeedHelper } from "@tangle-js/anchors";
import LdProofError from "../errors/ldProofError";
import LdProofErrorNames from "../errors/ldProofErrorNames";
import { IdentityHelper } from "../helpers/identityHelper";
export default class DidService {
    /**
     * Resolves the DID.
     * @param node Node against the DID is resolved.
     * @param did DID to be resolved.
     * @returns The DID Document resolved from Tangle.
     */
    static async resolve(node, did) {
        let doc;
        try {
            const identityClient = await IdentityHelper.getClient(node);
            const resolution = await identityClient.resolve(did);
            doc = resolution.document();
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
            throw new LdProofError(LdProofErrorNames.DID_NOT_FOUND, "DID cannot be resolved");
        }
        try {
            doc.verifyDocument(doc);
        }
        catch {
            throw new LdProofError(LdProofErrorNames.DID_NOT_VERIFIED, "DID cannot be verified");
        }
        return doc;
    }
    /**
     * Resolves the DID verification method.
     * @param node Node against the DID is resolved.
     * @param didMethod DID method to be resolved.
     * @returns The DID Document resolved from Tangle.
     */
    static async resolveMethod(node, didMethod) {
        try {
            const didDocument = await this.resolve(node, didMethod.split("#")[0]);
            const scope = undefined;
            return didDocument.resolveMethod(didMethod, scope);
        }
        catch {
            throw new LdProofError(LdProofErrorNames.DID_NOT_FOUND, "DID cannot be resolved");
        }
    }
    /**
     * Verifies that the secret really corresponds to the verification method.
     *
     * @param didDocument DID document.
     * @param method The method (expressed as a fragment identifier).
     * @param secret The private key.
     * @returns True if verified false if not.
     */
    static async verifyOwnership(didDocument, method, secret) {
        // First we verify if the method really exists on the DID
        try {
            const scope = undefined;
            didDocument.resolveMethod(`${didDocument.id()}#${method}`, scope);
        }
        catch {
            throw new LdProofError(LdProofErrorNames.INVALID_DID_METHOD, "The DID method supplied is not valid");
        }
        try {
            const verificationData = { "testData": SeedHelper.generateSeed(10) };
            const signature = await didDocument.signData(verificationData, secret, `${didDocument.id()}#${method}`, ProofOptions.default());
            return didDocument.verifyData(signature, VerifierOptions.default());
        }
        catch {
            throw new LdProofError(LdProofErrorNames.INVALID_SIGNING_KEY, "The key supplied is not valid");
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlkU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9kaWRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdDQUF3QztBQUd4QyxPQUFPLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3hFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNoRCxPQUFPLFlBQVksTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLGlCQUFpQixNQUFNLDZCQUE2QixDQUFDO0FBQzVELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUUzRCxNQUFNLENBQUMsT0FBTyxPQUFPLFVBQVU7SUFDM0I7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFZLEVBQUUsR0FBVztRQUNqRCxJQUFJLEdBQWdCLENBQUM7UUFDckIsSUFBSTtZQUNBLE1BQU0sY0FBYyxHQUFHLE1BQU0sY0FBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU1RCxNQUFNLFVBQVUsR0FBRyxNQUFNLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckQsR0FBRyxHQUFHLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUMvQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1Isc0NBQXNDO1lBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZixNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFDbEQsd0JBQXdCLENBQUMsQ0FBQztTQUNqQztRQUVELElBQUk7WUFDQSxHQUFHLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzNCO1FBQUMsTUFBTTtZQUNKLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLEVBQ3JELHdCQUF3QixDQUFDLENBQUM7U0FDakM7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQVksRUFBRSxTQUFpQjtRQUM3RCxJQUFJO1lBQ0EsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdEUsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDO1lBQ3hCLE9BQU8sV0FBVyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDdEQ7UUFBQyxNQUFNO1lBQ0osTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQ2xELHdCQUF3QixDQUFDLENBQUM7U0FDakM7SUFDTCxDQUFDO0lBR0Q7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLFdBQXdCLEVBQ3hELE1BQWMsRUFBRSxNQUFrQjtRQUNsQyx5REFBeUQ7UUFDekQsSUFBSTtZQUNBLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQztZQUN4QixXQUFXLENBQUMsYUFBYSxDQUFDLEdBQUcsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLE1BQU0sRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3JFO1FBQUMsTUFBTTtZQUNKLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLEVBQ3ZELHNDQUFzQyxDQUFDLENBQUM7U0FDL0M7UUFFRCxJQUFJO1lBQ0EsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFFckUsTUFBTSxTQUFTLEdBQUcsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUN6RCxNQUFNLEVBQ04sR0FBRyxXQUFXLENBQUMsRUFBRSxFQUFFLElBQUksTUFBTSxFQUFFLEVBQUUsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFFN0QsT0FBTyxXQUFXLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztTQUN2RTtRQUFDLE1BQU07WUFDSixNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixFQUN4RCwrQkFBK0IsQ0FBQyxDQUFDO1NBQ3hDO0lBQ0wsQ0FBQztDQUNKIn0=