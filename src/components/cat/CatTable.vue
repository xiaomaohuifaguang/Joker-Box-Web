<template>
    <table className="table">
            <thead>
                <tr>
                    <th v-for="header in props.tableData.headers">{{ header.name }}</th>
                    <th v-if="props.tableData.operationBar && props.tableData.operationBar.length > 0" class="flex justify-center">
                        操作列
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in props.tableData.list">
                    <td v-for="header in props.tableData.headers">{{ item[header.key] }}</td>
                    <td v-if="props.tableData.operationBar && props.tableData.operationBar.length > 0" class="flex justify-center">
                        <button :class="getButtonClass(operation)" :style="operation.style && operation.style !='' ? operation.style : ''"
                            v-for="operation in props.tableData.operationBar" @click="operation.method(item)">
                            {{ operation.name }}
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
</template>

<script lang="ts" setup>

const props = defineProps<{
    tableData: TableData; // 直接使用 TableData 接口作为类型
}>();

interface TableData {
    headers: TableHeader[]
    list?: any[],
    operationBar?: Operation[]
}
interface TableHeader {
    name: string,
    key: string
}
interface Operation {
    name: string,
    method: (param: any) => void,
    type?: "add"|"delete"|"edit"|"view"
    class?: string,
    style?: string
}

const getButtonClass = (operation: Operation) => {
    switch(operation.type){
        case "add": return "btn btn-outline btn-success btn-sm mr-1";
        case "delete": return "btn btn-outline btn-error btn-sm mr-1";
        case "edit": return "btn btn-outline btn-warning btn-sm mr-1";
        case "view": return "btn btn-outline btn-info btn-sm mr-1";
    }

    return operation.class && operation.class != '' ? operation.class : "btn btn-outline btn-success btn-sm mr-1";
}

</script>

<style lang="scss" scoped></style>