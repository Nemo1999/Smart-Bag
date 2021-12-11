var Roles = {}
var Roles_State = "show"
var Device_State = "show"
var connected_devices = []
var focus_state = {
    "device": null,
    "role": null
}



function assign_role(device_name, role_name){
    if (connected_devices[device_name]["role"] != null){
        remove_role(device_name, connected_devices[device_name]["role"])
    }
    // fetch devices information from server
    fetch('/assign_role', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "device_name": device_name,
            "role_name": role_name
        })
    })
    .then(response => response.json())
    .then(data =>{
        console.log(data)
        //stop loading animation
        if(data.status == "success"){
            Roles[role_name].current_device = device_name
            connected_devices[device_name]["role"] = role_name
        }
        else{
            alert("Assign role failed")
        }
    }
    )
}

function remove_role(device_name, role_name){
    
    // fetch devices information from server
    fetch('/remove_role', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "device_name": device_name,
            "role_name": role_name
        })
    })
    .then(response => response.json())
    .then(data =>{
        console.log(data)
        //stop loading animation
        if(data.status == "success"){
            Roles[role_name].current_device = null
            connected_devices[device_name]["role"] = null
        }
        else{
            alert("Remove role failed")
        }
      
    }
    )
}

function remove_device(device_name){
    //start loading animation
    showLoading();

    focus_state.device = null;
    focus_state.role = null;
    
    // remove assigned role first 
    if(connected_devices[device_name]["role"] != null){
        remove_role(device_name, connected_devices[device_name]["role"])
    }
    // fetch devices information from server
    fetch('/remove_device', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "device_name": device_name
        })
    })
    .then(response => response.json())
    .then(data =>{
        console.log(data)
        //stop loading animation
        if(data.status == "success"){

        let device_list = document.getElementById("device_list");
        let node = device_list.querySelector(`.${device_name}`)
        node.onmouseenter = undefined
        node.onmouseleave = undefined
        node.onclick = undefined
        //node.querySelector(".remove_btn").onclick = undefined
        node.querySelector(".test_btn").onclick = undefined
        device_list.removeChild(node)
        delete connected_devices[device_name]

        update_status(focus_state)
        update_roles(focus_state)
        update_devices(focus_state)
        }
        else{
            alert("Remove device failed")
        }
        setTimeout(removeLoading, 300);
    })
}

//callback function for remove button in the upper right panel
function remove_focused_device(){
    remove_device(focus_state.device)
}

//callback function for change role button in the upper right panel
function change_focused_role(){
    let panel_div = document.querySelector(".panel")
    panel_div.style.opacity = 0.3   
    panel_div.style.pointerEvents = "none"
    Roles_State = "select"
    update_roles({device:null, role:null})
}

//callback function for contraol value range input in the upper right panel
function update_value_range(){
    let control_value_node = document.querySelector(".control-value")
    let value = control_value_node.querySelector('input').value
    control_value_node.querySelector('p').textContent = value.toString()
    connected_devices[focus_state.device]["Control Value"] = value
}   

function update_status(focus){
    // show hovered device (focus.device) if no item selected (focus_state == null), else show selected item (focus_state) 
    if (focus_state.device != null && focus_state.role != null){
        focus = focus_state 
    }
    // update device list in upper right panel
    let role_node = document.querySelector(".role-id")
    let device_node = document.querySelector(".device-id")
    let connect_time_node = document.querySelector(".connect-time")
    let control_value_node = document.querySelector(".control-value")

    //console.log(control_value_node, connect_time_node)
    //console.log(focus)
    if(focus.device == null && focus.role == null){
        [role_node, device_node, connect_time_node, control_value_node].forEach(function(node){
            node.querySelector('div').classList.add("disabled")
            node.style.opacity = 0.5
            if(node.querySelector('button')){
                node.querySelector('button').classList.add("disabled")
                node.querySelector('button').classList.add("hide")
            }
            else{
                node.querySelector('input').classList.add("disabled")
                node.querySelector('input').classList.add("hide")
            }
                
            node.querySelector('p').textContent = "--"
        })
    }
    else if(focus.device == null){
        role_node.querySelector('p').textContent = focus.role
        role_node.querySelector('div').classList.remove("disabled")
        role_node.querySelector('button').classList.add("disabled")
        role_node.querySelector('button').classList.add("hide")
        role_node.style.opacity = 0.8

        device_node.querySelector('p').textContent = "Not Assigned"
        device_node.querySelector('div').classList.remove("disabled")
        device_node.querySelector('button').classList.remove("disabled")
        device_node.querySelector('button').classList.remove("hide")
        device_node.style.opacity = 0.8

        for(let node of [connect_time_node, control_value_node]){
            //console.log(node);
            node.querySelector('div').classList.add("disabled");
            node.style.opacity = 0.5;
            if(node.querySelector('button')){
                node.querySelector('button').classList.add("disabled");
                node.querySelector('button').classList.add("hide");
            }
            else{
                node.querySelector('input').classList.add("disabled");
                node.querySelector('input').classList.add("hide");
            }
            node.querySelector('p').textContent = "--";
        }
    }
    else{
        let current_role = connected_devices[focus.device]["role"]
        role_node.querySelector('p').textContent = current_role? current_role : "Not Assigned"
        role_node.querySelector('div').classList.remove("disabled")
        role_node.querySelector('button').classList.remove("disabled")
        role_node.querySelector('button').classList.remove("hide")
        role_node.style.opacity = 0.8

        device_node.querySelector('p').textContent = focus.device
        device_node.querySelector('div').classList.remove("disabled")
        device_node.querySelector('button').classList.remove("disabled")
        device_node.querySelector('button').classList.remove("hide")
        device_node.style.opacity = 0.8

        connect_time_node.querySelector('p').textContent = connected_devices[focus.device]["Connect Time"]
        connect_time_node.querySelector('div').classList.remove("disabled")
        connect_time_node.querySelector('button').classList.remove("disabled")
        connect_time_node.querySelector('button').classList.remove("hide")
        connect_time_node.style.opacity = 0.8

        control_value_node.querySelector('p').textContent = connected_devices[focus.device]["Control Value"]
        control_value_node.querySelector('input').value = parseInt(connected_devices[focus.device]["Control Value"])
        control_value_node.querySelector('div').classList.remove("disabled")
        control_value_node.querySelector('input').classList.remove("disabled")
        control_value_node.querySelector('input').classList.remove("hide")
        control_value_node.style.opacity = 0.8

    }
}



function create_devices(connected_devices){
    // update device list in lower right panel
    let device_list = document.getElementById("device_list");
    // remove all list elements
    device_list.innerHTML = "" 
    // add new list elements
    let device_element_template = document.getElementById("device_element_template");
    for(let name_text of Object.keys(connected_devices)){
        let new_device = device_element_template.content.cloneNode(true);
        let device_name = new_device.querySelector('h4');
        device_name.textContent = name_text;
        
        
       
    
        device_list.appendChild(new_device);

        let new_node = device_list.children[device_list.children.length - 1]
        new_node.dead = false;
        new_node.classList.add(name_text)
         //set callback function
        new_node.onmouseenter = () => {
            console.log(name_text)
            let current_focus =  {device: name_text, role: connected_devices[name_text]["role"]}
            update_status(current_focus)
            update_roles(current_focus)
            update_devices(current_focus)
        }
        new_node.onclick = () => {
            console.log("I am here")
            if( ! new_node.dead){
                if(focus_state.device != name_text){
                    focus_state =  {device: name_text, role: connected_devices[name_text]["role"]}
                    update_status(focus_state)
                    update_roles(focus_state)
                    update_devices(focus_state)
                }else{
                    focus_state = {device: null, role: null}
                    let current_focus = {device: name_text, role: connected_devices[name_text]["role"]}
                    update_status(current_focus)
                    update_roles(current_focus)
                    update_devices(current_focus)
                }
            }
            
        }

        new_node.onmouseleave = () => {
            let current_focus =  {device: name_text, role: connected_devices[name_text]["role"]}
            update_status(focus_state)
            update_roles(focus_state)
            update_devices(focus_state)
        }
        
        /*
        new_node.querySelector(".remove_btn").onclick = () => {
                    new_node.dead = true;
            remove_device(name_text)
        }
        */

        new_node.querySelector(".test_btn").onclick = () => {
            fetch('/test_device', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "device_name": name_text
                        })
                })
            .then(response => response.json())
            .then(data =>{
                console.log(data)
                if(data.status == "success"){
                    alert("Test device success")
                }
                else{
                    alert("Test device failed")
                }
            }
            )
        }
    }                    
}

function update_devices(focus){
    // update device list in lower right panel
    let color_focus = focus
    if(focus_state.device != null){
        color_focus = focus_state
    }

    let device_list = document.getElementById("device_list");
    for (let node of device_list.children){
        current_device = node.querySelector('h4').textContent
        
        // change opacity if hovered
        if (focus.device == current_device){
            node.style.opacity = 0.8
        }else{
            node.style.opacity = 0.7
        }
        // change color if selected or connected
        if(current_device == focus_state.device ){
            node.classList.remove("list-group-item-green")
            node.classList.remove("list-group-item-dark")
            node.classList.add("list-group-item-orange")
        }
        else if(connected_devices[node.querySelector('h4').textContent]["role"] != null){
            node.classList.remove("list-group-item-orange")
            node.classList.remove("list-group-item-dark")
            node.classList.add("list-group-item-green")
        }
        else{
            node.classList.remove("list-group-item-orange")
            node.classList.remove("list-group-item-green")
            node.classList.add("list-group-item-dark")
        }
    }
}



function setStroke(node, color, width, opacity){
    //change the stroke color and stroke width of every descendent path and polypath node
    node.querySelectorAll('path, polyline').forEach(function(path){
        if(color != null)
        path.style.stroke = color
        if(width != null)
        path.style.strokeWidth = width
        if(opacity != null)
        path.style.opacity = opacity
    })
}

function update_roles(focus){
    if (Roles_State == "show"){

        let color_focus = focus
        if(focus_state.role != null){
            color_focus = focus_state                
        }
        
        for(let role_name of Object.keys(Roles)){
            role_div = Roles[role_name]

            // change opacity if hovered
            if(focus.role == role_name){
                setStroke(role_div, null , "7px", 0.8)
            }
            else{
                setStroke(role_div, null , "4px", 0.7)
            }

            // change color if selected or connected
            if(color_focus.role != null && role_name == focus_state.role ){
                setStroke(role_div, "#E3C691" , null , null)
            }
            else if(role_div.current_device != null){
                setStroke(role_div, "#67832B", null, null)
            }
            else{
                setStroke(role_div, "#837F7C", null, null)
            }
        }
    }
    else{


        // Roles_State = "select"
        for(let role_name of Object.keys(Roles)){
            role_div = Roles[role_name]

            // change opacity if hovered
            if(focus.role == role_name){
                setStroke(role_div, null , "7px", 0.8)
            }
            else{
                setStroke(role_div, null , "4px", 0.7)
            }

            // hovered
            if(focus.role != null && role_name == focus_state.role ){
                setStroke(role_div, "#E3C691" , null , null)
            }
            // available
            if(role_div.current_device == null || focus_state.device==role_name){
                setStroke(role_div, "#C9BFBB", null, null)
            }
            // ocupied
            else{
                setStroke(role_div, "#4C6020", null, null)
            }
        }
    }
}

function refresh_devices(){
    //start loading animation
    showLoading();
    focus_state = {device: null, role: null}
    // fetch devices information from server
    fetch('/scan_devices')
    .then(response => response.json())
    .then(data =>{
        console.log(data.devices)
        if(data.status != "success"){
            alert("Error in fetching devices")
        }
        else{
            connected_devices = data.devices

            //update current device in each element of Roles
            for(let role_name of Object.keys(Roles)){
                Roles[role_name].current_device = null
            }
            for(let key of Object.keys(connected_devices)){
                device = connected_devices[key]
                console.log(key)
                if(device["role"] != null){
                    Roles[device["role"]].current_device = key
                }
            }
            create_devices(connected_devices)
            update_roles(focus_state)
            update_devices(focus_state)
        }
        //stop loading animation
        setTimeout(removeLoading, 300);        
    })
}