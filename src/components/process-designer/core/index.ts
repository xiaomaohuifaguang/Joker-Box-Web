import StartEvent from "./nodes/StartEvent"
import EndEvent from "./nodes/EndEvent"
import UserTask from "./nodes/UserTask";
import SequenceFlow from "./edges/SequenceFlow";
import ExclusiveGateway from './nodes/ExclusiveGateway'
import LogicFlow from "@logicflow/core";

export const registerCustomElement = (lf: LogicFlow) => {

    lf.register(StartEvent);
    lf.register(EndEvent);
    lf.register(UserTask);
    lf.register(SequenceFlow);
    lf.register(ExclusiveGateway);

}