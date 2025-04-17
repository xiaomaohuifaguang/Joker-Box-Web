export enum TaskStatusEnum {
    /**
     * 未开始
     */
    NOT_START = -1,

    /**
     * 待审批
     */
    WAIT = 0,
    /**
     * 审批中
     */
    RUNNING = 1,
    /**
     * 审批通过
     */
    APPROVE = 2,

    /**
     * 审批不通过
     */
    REJECT = 3,

    /**
     * 已取消
     */
    CANCEL = 4,
    /**
     * 已退回
     */
    RETURN = 5,
    /**
     * 审批通过中
     */
    APPROVING = 7
}