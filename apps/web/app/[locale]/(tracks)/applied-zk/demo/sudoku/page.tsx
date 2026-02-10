"use client";

import dynamic from "next/dynamic";
import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";

const SudokuDemo = dynamic(
  () =>
    import("../../../../../../components/applied-zk/sudoku-demo").then(
      (m) => m.SudokuDemo,
    ),
  { ssr: false },
);

export default function SudokuPage() {
  return (
    <DemoPageWrapper trackKey="appliedZk" demoSlug="sudoku">
      <SudokuDemo />
    </DemoPageWrapper>
  );
}
