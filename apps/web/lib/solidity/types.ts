export interface TypeInfo {
  readonly name: string;
  readonly category: "integer" | "address" | "bool" | "bytes";
  readonly size: number;
  readonly bits: number;
  readonly signed: boolean;
  readonly min: string;
  readonly max: string;
  readonly defaultValue: string;
}

export interface EncodedValue {
  readonly hex: string;
  readonly paddedHex: string;
  readonly decimal: string;
  readonly valid: boolean;
  readonly error?: string;
}

const TWO = BigInt(2);

function buildIntegerType(bits: number, signed: boolean): TypeInfo {
  const prefix = signed ? "int" : "uint";
  const name = `${prefix}${bits}`;
  const size = bits / 8;

  let min: string;
  let max: string;

  if (signed) {
    min = (-(TWO ** BigInt(bits - 1))).toString();
    max = (TWO ** BigInt(bits - 1) - BigInt(1)).toString();
  } else {
    min = "0";
    max = (TWO ** BigInt(bits) - BigInt(1)).toString();
  }

  return {
    name,
    category: "integer",
    size,
    bits,
    signed,
    min,
    max,
    defaultValue: "0",
  };
}

const TYPE_MAP: Record<string, TypeInfo> = {};

for (const bits of [8, 16, 32, 64, 128, 256]) {
  const unsigned = buildIntegerType(bits, false);
  const signed = buildIntegerType(bits, true);
  TYPE_MAP[unsigned.name] = unsigned;
  TYPE_MAP[signed.name] = signed;
}

TYPE_MAP["bool"] = {
  name: "bool",
  category: "bool",
  size: 1,
  bits: 8,
  signed: false,
  min: "0",
  max: "1",
  defaultValue: "false",
};

TYPE_MAP["address"] = {
  name: "address",
  category: "address",
  size: 20,
  bits: 160,
  signed: false,
  min: "0x0000000000000000000000000000000000000000",
  max: "0xffffffffffffffffffffffffffffffffffffffff",
  defaultValue: "0x0000000000000000000000000000000000000000",
};

for (const byteLen of [1, 2, 4, 8, 16, 32]) {
  const name = `bytes${byteLen}`;
  TYPE_MAP[name] = {
    name,
    category: "bytes",
    size: byteLen,
    bits: byteLen * 8,
    signed: false,
    min: "0x" + "00".repeat(byteLen),
    max: "0x" + "ff".repeat(byteLen),
    defaultValue: "0x" + "00".repeat(byteLen),
  };
}

export function getSolidityTypeInfo(typeName: string): TypeInfo | null {
  return TYPE_MAP[typeName] ?? null;
}

export function encodeValue(value: string, typeName: string): EncodedValue {
  const info = getSolidityTypeInfo(typeName);
  if (!info) {
    return {
      hex: "",
      paddedHex: "",
      decimal: "",
      valid: false,
      error: `Unknown type: ${typeName}`,
    };
  }

  try {
    if (info.category === "bool") {
      const boolVal = value === "true" || value === "1";
      const numVal = boolVal ? 1 : 0;
      return {
        hex: "0x" + numVal.toString(16).padStart(2, "0"),
        paddedHex: "0x" + numVal.toString(16).padStart(64, "0"),
        decimal: numVal.toString(),
        valid: true,
      };
    }

    if (info.category === "address") {
      const cleaned = value.startsWith("0x") ? value.slice(2) : value;
      if (cleaned.length !== 40 || !/^[0-9a-fA-F]+$/.test(cleaned)) {
        return {
          hex: "",
          paddedHex: "",
          decimal: "",
          valid: false,
          error: "Invalid address format",
        };
      }
      return {
        hex: "0x" + cleaned.toLowerCase(),
        paddedHex: "0x" + cleaned.toLowerCase().padStart(64, "0"),
        decimal: BigInt("0x" + cleaned).toString(),
        valid: true,
      };
    }

    if (info.category === "bytes") {
      const cleaned = value.startsWith("0x") ? value.slice(2) : value;
      if (!/^[0-9a-fA-F]*$/.test(cleaned)) {
        return {
          hex: "",
          paddedHex: "",
          decimal: "",
          valid: false,
          error: "Invalid hex value",
        };
      }
      const padded = cleaned.padEnd(info.size * 2, "0").slice(0, info.size * 2);
      return {
        hex: "0x" + padded,
        paddedHex: "0x" + padded.padEnd(64, "0"),
        decimal: BigInt("0x" + (padded || "0")).toString(),
        valid: true,
      };
    }

    // integer types
    const num = BigInt(value);
    const minVal = BigInt(info.min);
    const maxVal = BigInt(info.max);

    if (num < minVal || num > maxVal) {
      return {
        hex: "",
        paddedHex: "",
        decimal: "",
        valid: false,
        error: `Value out of range [${info.min}, ${info.max}]`,
      };
    }

    let hexStr: string;
    if (num < BigInt(0)) {
      // Two's complement for signed negative
      const twosComplement = TWO ** BigInt(info.bits) + num;
      hexStr = twosComplement.toString(16);
    } else {
      hexStr = num.toString(16);
    }

    return {
      hex: "0x" + hexStr,
      paddedHex: "0x" + hexStr.padStart(64, "0"),
      decimal: num.toString(),
      valid: true,
    };
  } catch {
    return {
      hex: "",
      paddedHex: "",
      decimal: "",
      valid: false,
      error: "Failed to encode value",
    };
  }
}

export function getAllSolidityTypes(): readonly TypeInfo[] {
  return Object.values(TYPE_MAP);
}
