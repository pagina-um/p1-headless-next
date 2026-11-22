import { getInfographicData } from "../_lib/data";
import { Infographic } from "./Infographic.client";

interface InfografiaProps {
  presentation?: "page" | "embed" | "inline";
}

/** Shared server entry point for the registered piece and both public routes. */
export default function Infografia({
  presentation = "inline",
}: InfografiaProps) {
  return <Infographic {...getInfographicData()} presentation={presentation} />;
}
