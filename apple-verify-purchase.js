/* Transaction history */
import {
  AppStoreServerAPIClient,
  Environment,
  GetTransactionHistoryVersion,
  Order,
  ProductType,
} from "@apple/app-store-server-library";
import { readFile } from "fs";

const issuerId = "";
const keyId = "";
const bundleId = "";
const filePath = "";
const environment = Environment.SANDBOX;

async function init() {
  const encodedKey = await new Promise((res, rej) => {
    readFile(filePath, (err, data) => {
      if (err) return rej(err);
      res(data);
    });
  });
  // Specific implementation may vary

  const client = new AppStoreServerAPIClient(
    encodedKey,
    keyId,
    issuerId,
    bundleId,
    environment
  );

  const transactionId = "2000000889069745";
  if (transactionId != null) {
    const transactionHistoryRequest = {
      sort: Order.ASCENDING,
      revoked: false,
      productTypes: [ProductType.AUTO_RENEWABLE],
    };
    let response = null;
    let transactions = [];
    do {
      const revisionToken =
        response !== null && response.revision !== null
          ? response.revision
          : null;
      response = await client.getTransactionHistory(
        transactionId,
        revisionToken,
        transactionHistoryRequest,
        GetTransactionHistoryVersion.V2
      );
      console.log("response is", response)
      if (response.signedTransactions) {
        transactions = transactions.concat(response.signedTransactions);
      }
    } while (response.hasMore);
    console.log(transactions);
  }
}
init();
