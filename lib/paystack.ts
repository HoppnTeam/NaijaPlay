interface PaystackTransactionResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

interface PaystackVerificationResponse {
  status: boolean
  message: string
  data: {
    status: string
    reference: string
    amount: number
    metadata: {
      purchase_id: string
      team_id: string
      package_id: string
      token_amount: number
    }
  }
}

interface PaystackTransactionInitializeParams {
  email: string
  amount: number
  reference: string
  callback_url: string
  metadata: {
    purchase_id: string
    team_id: string
    package_id: string
    token_amount: number
  }
}

export class PaystackClient {
  private readonly secretKey: string
  private readonly baseUrl = 'https://api.paystack.co'

  constructor(secretKey: string) {
    this.secretKey = secretKey
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.statusText}`)
    }

    return response.json()
  }

  transaction = {
    initialize: async (params: PaystackTransactionInitializeParams) => {
      const response = await this.request<PaystackTransactionResponse>('/transaction/initialize', {
        method: 'POST',
        body: JSON.stringify(params),
      })

      return {
        authorization_url: response.data.authorization_url,
        reference: response.data.reference,
      }
    },

    verify: async (reference: string) => {
      const response = await this.request<PaystackVerificationResponse>(
        `/transaction/verify/${reference}`
      )

      return {
        status: response.data.status,
        reference: response.data.reference,
        amount: response.data.amount,
        metadata: response.data.metadata,
      }
    },
  }
} 