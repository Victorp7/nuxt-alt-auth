export declare enum TokenStatusEnum {
    UNKNOWN = "UNKNOWN",
    VALID = "VALID",
    EXPIRED = "EXPIRED"
}
export declare class TokenStatus {
    #private;
    constructor(token: string | boolean, tokenExpiresAt: number | false, httpOnly?: boolean);
    unknown(): boolean;
    valid(): boolean;
    expired(): boolean;
}
