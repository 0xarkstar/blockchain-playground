import { keccak256, toHex, toBytes } from "viem";

export interface AbiParam {
  readonly name: string;
  readonly type: string;
  readonly value: string;
}

export interface EncodedCalldata {
  readonly selector: string;
  readonly encodedParams: readonly string[];
  readonly fullCalldata: string;
  readonly functionSignature: string;
}

export interface EventParam {
  readonly name: string;
  readonly type: string;
  readonly value: string;
  readonly indexed: boolean;
}

export interface EncodedLog {
  readonly topics: readonly string[];
  readonly data: string;
  readonly topicDescriptions: readonly string[];
}

export function buildFunctionSignature(
  name: string,
  paramTypes: readonly string[]
): string {
  return `${name}(${paramTypes.join(",")})`;
}

export function computeFunctionSelector(signature: string): string {
  const hash = keccak256(toHex(toBytes(signature)));
  return hash.slice(0, 10);
}

export function encodeParameter(value: string, type: string): string {
  if (type === "bool") {
    const boolVal = value === "true" || value === "1" ? "1" : "0";
    return boolVal.padStart(64, "0");
  }

  if (type === "address") {
    const cleaned = value.startsWith("0x") ? value.slice(2) : value;
    return cleaned.toLowerCase().padStart(64, "0");
  }

  if (type.startsWith("uint") || type.startsWith("int")) {
    const num = BigInt(value);
    let hex: string;
    if (num < BigInt(0)) {
      const twosComplement = (BigInt(1) << BigInt(256)) + num;
      hex = twosComplement.toString(16);
    } else {
      hex = num.toString(16);
    }
    return hex.padStart(64, "0");
  }

  if (type.startsWith("bytes")) {
    const cleaned = value.startsWith("0x") ? value.slice(2) : value;
    return cleaned.padEnd(64, "0");
  }

  return value.padStart(64, "0");
}

export function encodeCalldata(
  name: string,
  params: readonly AbiParam[]
): EncodedCalldata {
  const paramTypes = params.map((p) => p.type);
  const functionSignature = buildFunctionSignature(name, paramTypes);
  const selector = computeFunctionSelector(functionSignature);
  const encodedParams = params.map((p) => encodeParameter(p.value, p.type));
  const fullCalldata =
    selector + encodedParams.join("");

  return { selector, encodedParams, fullCalldata, functionSignature };
}

export function computeEventTopic(
  name: string,
  paramTypes: readonly string[]
): string {
  const signature = buildFunctionSignature(name, paramTypes);
  return keccak256(toHex(toBytes(signature)));
}

export function encodeLogEntry(
  eventName: string,
  params: readonly EventParam[]
): EncodedLog {
  const allTypes = params.map((p) => p.type);
  const topic0 = computeEventTopic(eventName, allTypes);

  const topics: string[] = [topic0];
  const topicDescriptions: string[] = [
    `topic[0]: ${eventName}(${allTypes.join(",")}) signature hash`,
  ];

  const dataParams: EventParam[] = [];

  for (const param of params) {
    if (param.indexed) {
      const encoded = "0x" + encodeParameter(param.value, param.type);
      topics.push(encoded);
      topicDescriptions.push(
        `topic[${topics.length - 1}]: ${param.name} (${param.type}, indexed)`
      );
    } else {
      dataParams.push(param);
    }
  }

  const data =
    "0x" +
    dataParams.map((p) => encodeParameter(p.value, p.type)).join("");

  return { topics, data, topicDescriptions };
}
