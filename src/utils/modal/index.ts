

export const message = (options: ModalOptions) => {
    let id = generateRandomId(10);
    let modal = document.createElement("dialog") as HTMLDialogElement;
    modal.id = id;
    modal.className="modal"

    let modal_box = document.createElement("div");
    modal_box.className = "modal-box"

    let modal_close_x = document.createElement("form");
    modal_close_x.method = "dialog"
    let modal_close_x_button = document.createElement("button");
    modal_close_x_button.className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
    modal_close_x_button.innerText="✕"
    modal_close_x.appendChild(modal_close_x_button)

    let modal_title = document.createElement("h3");
    modal_title.className = "font-bold text-lg"
    modal_title.innerHTML = options.title

    let modal_content = document.createElement("p");
    modal_content.className = "py-4"
    modal_content.innerText = options.content

    
    

    modal_box.appendChild(modal_title).appendChild(modal_close_x).appendChild(modal_content)


    // let modal_action = document.createElement("div");
    // modal_action.className = "modal-action"
    // modal_action.innerHTML = `<button class="btn btn-outline">关闭</button>`
    // modal_box.appendChild(modal_action)

    
    if(options.actions){
        let modal_action = document.createElement("div");
        modal_action.className = "modal-action"
        for(let index = 0 ; index < options.actions.length ; index++){
            let action = options.actions[index]
            let action_button = document.createElement("button")
            action_button.className="btn btn-outline btn-info min-h-9 h-9"
            action_button.innerHTML = action.name
            action_button.addEventListener("click",()=>{
                if(action.method){
                    action.method();
                }
                modal.remove();
            })
            modal_action.appendChild(action_button);
           
        }
        modal_box.appendChild(modal_action)
    }
    

    modal.appendChild(modal_box)

    document.body.appendChild(modal);
    modal.showModal();

    let activeElement = document.activeElement as HTMLElement;
    if(activeElement){
        activeElement.blur();
    }
    
}


export interface ModalOptions {
    title: string,
    content: string,
    actions?: Action[]

}

export interface Action {
    name: string,
    method?: () => void
}


/**
 * 随机id
 * @param length 长度
 * @returns 
 */
const generateRandomId = (length: number): string => {
    const randomValues = Array.from({ length }, () => Math.random().toString(36).substring(2));
    return randomValues.join('');
}





export default { message }