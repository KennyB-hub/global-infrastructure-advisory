// /src/ai/tools.js
import { MathEngine } from "./engines/math-engine.js";
import { LogicEngine } from "../backend/ai/logic-engine.js";
import { MappingEngine } from "./mapping-engine.js";
import { DataEngine } from "./engines/data-engine.js";
import { Mapping2DEngine } from "../sector/agri/visual/mapping-2d-engine.js";
import { Mapping3DEngine } from "../sector/agri/visual/mapping-3d-engine.js";
import { BlueprintEngine } from "../sector/agri/visual/blueprint-engine.js";
import { DocumentEngine } from "../sector/agri/visual/document-engine.js";

export class Tools {
  constructor(env) {
    this.env = env;

    this.math = new MathEngine();
    this.logic = new LogicEngine();
    this.mapping = new MappingEngine();
    this.data = new DataEngine();

    this.map2d = new Mapping2DEngine();
    this.map3d = new Mapping3DEngine();
    this.blueprint = new BlueprintEngine();
    this.document = new DocumentEngine();
  }
}
