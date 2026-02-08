"use client";

import { useState, useMemo, useRef } from "react";
import {
  Stack,
  Paper,
  TextInput,
  Button,
  Code,
  Group,
  Text,
  Textarea,
  Table,
  Badge,
} from "@mantine/core";
import {
  buildMetadataJSON,
  buildTokenURI,
  type NFTMetadata,
} from "../../lib/tokens/erc721";

interface AttributeWithId {
  readonly id: number;
  readonly traitType: string;
  readonly value: string;
}

export function NFTMetadataDemo() {
  const nextId = useRef(3);
  const [name, setName] = useState("Cool NFT #1");
  const [description, setDescription] = useState("A very cool NFT");
  const [image, setImage] = useState("ipfs://QmExampleHash");
  const [externalUrl, setExternalUrl] = useState("");
  const [baseUri, setBaseUri] = useState("https://api.example.com/token/");
  const [tokenId, setTokenId] = useState("1");
  const [attributes, setAttributes] = useState<readonly AttributeWithId[]>([
    { id: 1, traitType: "Background", value: "Blue" },
    { id: 2, traitType: "Rarity", value: "Legendary" },
  ]);
  const [newTraitType, setNewTraitType] = useState("");
  const [newTraitValue, setNewTraitValue] = useState("");

  const metadata: NFTMetadata = useMemo(
    () => ({
      name,
      description,
      image,
      externalUrl: externalUrl || undefined,
      attributes: attributes.map((a) => ({
        trait_type: a.traitType,
        value: a.value,
      })),
    }),
    [name, description, image, externalUrl, attributes],
  );

  const json = useMemo(() => buildMetadataJSON(metadata), [metadata]);
  const uri = useMemo(
    () => buildTokenURI(Number(tokenId) || 0, baseUri),
    [tokenId, baseUri],
  );

  const addAttribute = () => {
    if (!newTraitType.trim()) return;
    setAttributes([
      ...attributes,
      { id: nextId.current++, traitType: newTraitType, value: newTraitValue },
    ]);
    setNewTraitType("");
    setNewTraitValue("");
  };

  const removeAttribute = (id: number) => {
    setAttributes(attributes.filter((a) => a.id !== id));
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            NFT Metadata
          </Text>
          <Group grow>
            <TextInput
              label="Name"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
            <TextInput
              label="Image URI"
              value={image}
              onChange={(e) => setImage(e.currentTarget.value)}
            />
          </Group>
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            rows={2}
          />
          <TextInput
            label="External URL (optional)"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.currentTarget.value)}
          />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Attributes
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Trait Type</Table.Th>
                <Table.Th>Value</Table.Th>
                <Table.Th w={80}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {attributes.map((attr) => (
                <Table.Tr key={attr.id}>
                  <Table.Td>
                    <Code>{attr.traitType}</Code>
                  </Table.Td>
                  <Table.Td>
                    <Code>{attr.value}</Code>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      onClick={() => removeAttribute(attr.id)}
                    >
                      Remove
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Group grow>
            <TextInput
              placeholder="Trait type"
              value={newTraitType}
              onChange={(e) => setNewTraitType(e.currentTarget.value)}
            />
            <TextInput
              placeholder="Value"
              value={newTraitValue}
              onChange={(e) => setNewTraitValue(e.currentTarget.value)}
            />
          </Group>
          <Button onClick={addAttribute} variant="light" size="sm">
            Add Attribute
          </Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Token URI
          </Text>
          <Group grow>
            <TextInput
              label="Base URI"
              value={baseUri}
              onChange={(e) => setBaseUri(e.currentTarget.value)}
            />
            <TextInput
              label="Token ID"
              value={tokenId}
              onChange={(e) => setTokenId(e.currentTarget.value)}
            />
          </Group>
          <Text size="sm">
            Full URI: <Code>{uri}</Code>
          </Text>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Metadata Tree
          </Text>
          <Paper
            p="sm"
            withBorder
            style={{
              background:
                "var(--mantine-color-dark-7, var(--mantine-color-gray-0))",
            }}
          >
            <Stack gap={4}>
              <Text size="sm" ff="monospace">
                <Badge size="xs" variant="light" color="blue" mr={4}>
                  object
                </Badge>
                metadata
              </Text>
              <Paper p="xs" ml="lg" withBorder>
                <Stack gap={2}>
                  <Text size="xs" ff="monospace">
                    <Badge size="xs" variant="light" color="green" mr={4}>
                      string
                    </Badge>
                    name: <Code>{metadata.name}</Code>
                  </Text>
                  <Text size="xs" ff="monospace">
                    <Badge size="xs" variant="light" color="green" mr={4}>
                      string
                    </Badge>
                    description:{" "}
                    <Code>
                      {metadata.description.slice(0, 40)}
                      {metadata.description.length > 40 ? "..." : ""}
                    </Code>
                  </Text>
                  <Text size="xs" ff="monospace">
                    <Badge size="xs" variant="light" color="green" mr={4}>
                      string
                    </Badge>
                    image: <Code>{metadata.image}</Code>
                  </Text>
                  {metadata.externalUrl && (
                    <Text size="xs" ff="monospace">
                      <Badge size="xs" variant="light" color="green" mr={4}>
                        string
                      </Badge>
                      external_url: <Code>{metadata.externalUrl}</Code>
                    </Text>
                  )}
                  <Text size="xs" ff="monospace">
                    <Badge size="xs" variant="light" color="violet" mr={4}>
                      array[{metadata.attributes?.length ?? 0}]
                    </Badge>
                    attributes
                  </Text>
                  {metadata.attributes && metadata.attributes.length > 0 && (
                    <Paper p="xs" ml="lg" withBorder>
                      <Stack gap={2}>
                        {metadata.attributes.map((attr, i) => (
                          <Text key={i} size="xs" ff="monospace">
                            <Badge
                              size="xs"
                              variant="outline"
                              color="violet"
                              mr={4}
                            >
                              {i}
                            </Badge>
                            {attr.trait_type}: <Code>{attr.value}</Code>
                          </Text>
                        ))}
                      </Stack>
                    </Paper>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Generated JSON
            </Text>
            <Badge variant="light">{new Blob([json]).size} bytes</Badge>
          </Group>
          <Code block style={{ maxHeight: 300, overflow: "auto" }}>
            {JSON.stringify(JSON.parse(json), null, 2)}
          </Code>
        </Stack>
      </Paper>
    </Stack>
  );
}
