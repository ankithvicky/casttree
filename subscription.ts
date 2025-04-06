import {
  AppStoreServerAPIClient,
  Environment,
  GetTransactionHistoryVersion,
  Order,
  ProductType,
} from "@apple/app-store-server-library";
import { readFile } from "fs";

interface ICTSubscriptionDTO {}
interface IAppleSubscriptionCreateDTO {
  transactionId: string;
}
interface IGoogleSubscriptionCreateDTO {}
interface ICreateSubscriptionDTO {
  provider: number;
  data:
    | ICTSubscriptionDTO
    | IAppleSubscriptionCreateDTO
    | IGoogleSubscriptionCreateDTO;
}

interface IAppleTranasctionInfoEncrypted {
  signedTransactionInfo: string;
}

interface IAppleTranasctionInfo {
  transactionId: string;
  originalTransactionId: string;
  webOrderLineItemId: string;
  bundleId: string;
  productId: string;
  subscriptionGroupIdentifier: string;
  purchaseDate: number;
  originalPurchaseDate: number;
  expiresDate: number;
  quantity: number;
  type: string;
  inAppOwnershipType: string;
  environment: string;
  transactionReason: string;
  storefront: string;
  storefrontId: string;
  currency: string;
  appTransactionId: string;
  signedDate: number;
  price: number;
}

class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}
  createSubscription(data: ICreateSubscriptionDTO) {
    this.subscriptionService.createSubscription(data);
  }
}

class SubscriptionService {
  createSubscription(input: ICreateSubscriptionDTO) {
    const provider = SubscriptionFactory.getProvider(input.provider);
    provider.createSubscription(input.data);
  }
}

interface ISubscriptionProvider {
  createSubscription(
    data:
      | ICTSubscriptionDTO
      | IAppleSubscriptionCreateDTO
      | IGoogleSubscriptionCreateDTO
  ): Promise<void>;
  handleEvents(): void;
}
interface ITransactionHistoryResponse {
  revision: string;
  bundleId: string;
  environment: string;
  hasMore: boolean;
  signedTransactions: string[];
}

class AppleSubscriptionProvider implements ISubscriptionProvider {
  issuerId: string = "76c51240-1e94-4468-ac3b-3a82a557ae55";
  keyId: string = "53Y2MPF778";
  bundleId: string = "com.billionfaces.projects.CtRnIapStarter";
  filePath: string = "./src/SubscriptionKey_53Y2MPF778.p8"; // should be outside repo
  environment = Environment.SANDBOX;
  client: any; // Specify the Data type
  constructor() {
    this.init();
  }
  async init() {
    try {
      const encodedKey: any = await new Promise((res, rej) => {
        readFile(this.filePath, (err, data) => {
          if (err) return rej(err);
          res(data);
        });
      });

      this.client = new AppStoreServerAPIClient(
        encodedKey,
        this.keyId,
        this.issuerId,
        this.bundleId,
        this.environment
      );
    } catch (err) {
      console.error("Failed to init", err);
    }
  }

  async createSubscription(data: IAppleSubscriptionCreateDTO): Promise<void> {
    try {
      const validationResp = await this.validateTransaction(data);
      if(validationResp.success) throw new Error("Transaction is not valid");
      // Create Tranasction
    } catch (err) {
      console.error("Failed to create subscription", err);
    }
  }

  async validateTransaction(
    data: IAppleSubscriptionCreateDTO
  ): Promise<{ success: boolean; transactionInfo: IAppleTranasctionInfo }> {
    try {
      const transactionId = data.transactionId;
      if (!transactionId) throw new Error("transactionId is required");
      let response: IAppleTranasctionInfoEncrypted =
        await this.client.getTransactionInfo(transactionId);
      const transactionInfo: IAppleTranasctionInfo = this.parseJwt(
        response.signedTransactionInfo
      );
      return {
        success: transactionInfo.expiresDate > Date.now(),
        transactionInfo,
      };
    } catch (err) {
      console.error("Failed to get transaction", err);
      throw err;
    }
  }

  handleEvents(): void {
    throw new Error("Method not implemented.");
  }

  parseJwt(token) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  }
}

class GoogleSubscriptionProvider implements ISubscriptionProvider {
  async createSubscription(data: IGoogleSubscriptionCreateDTO): Promise<void> {
    
  }
  handleEvents(): void {
    throw new Error("Method not implemented.");
  }
}

class SubscriptionFactory {
  static getProvider(providerId: Number): ISubscriptionProvider {
    let provider: ISubscriptionProvider;
    switch (providerId) {
      case 1:
        provider = new AppleSubscriptionProvider();
        break;
      case 2:
        provider = new GoogleSubscriptionProvider();
        break;
      default:
        provider = new GoogleSubscriptionProvider();
        break;
    }
    return provider;
  }
}
