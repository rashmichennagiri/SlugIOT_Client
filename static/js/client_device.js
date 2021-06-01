// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app_device = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app_device) => {

    // vue data variables:
    app_device.data = {
        slugIOT_server_url: "http://127.0.0.1:8000/SlugIOT_Server/api/",
        ask_for_device: true, // TODO ask_for_device_id
        has_error: false,

        device_id: "",
        rows: [], // contains device details (mac, registration date, etc.)
        
        //procedure details
        procedure_name: "",
        procedure_id: "",
        procedure_code: "set temp = 25;",
        procedure_last_updated: "",
        // p name, code, id, last updated
        
        // logs
        logs: [],
        
        //outputs
        outputs: [],
        // outputs_synced: false
    };

    app_device.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    // This decorates the rows (e.g. that come from the server)
    // adding information on their state:
    // - clean: read-only, the value is saved on the server
    // - edit : the value is being edited
    // - pending : a save is pending.
    app_device.decorate = (a) => {
        a.map((e) => {e._state = {device_id: "clean", procedure_name: "clean"} ;});
        return a;
    }


    app_device.reset_form = function () {
        app_device.vue.device_id = "";
    };


    app_device.get_device_details = function() {

        d_url =  app_device.vue.slugIOT_server_url + "device/" + app_device.vue.device_id;
        console.log("url = " + d_url)
        
        axios.get(d_url)
        .then(function (response) {

            console.log("received at client: ");
            console.log(response.data);
            
            app_device.vue.rows = app_device.decorate(app_device.enumerate(
                                        response.data.items));
            
            console.log("app_device.vue.rows.length = " + app_device.vue.rows.length);

            if(app_device.vue.rows.length == 1){
                // console.log(app_device.vue.rows.length);
                app_device.vue.ask_for_device = false;
                app_device.vue.has_error = false;
                
                // fetch all procedures from slugiot server

                // display currently installed procedure


                // display all outputs from table
                app_device.load_outputs();

                // display all logs from table
                app_device.load_logs();
            
            }
            else if(app_device.vue.rows.length == 0){
                app_device.vue.ask_for_device = true;
                app_device.vue.has_error = true;
            }
        }).catch(error => console.log(error));
    }

    // LOAD LOGS
    app_device.load_logs = function(){
        
        axios.get(load_logs_url)
        .then(function (response) {
            
            app_device.vue.logs = app_device.decorate(app_device.enumerate(response.data.rows));
            console.log(app_device.vue.logs);
        });
    }

    // sends logs to slugIOT server in the form of POST request
    // clear table after sync
    // TODO:check if can send only new logs to server
    app_device.sync_logs = function(){
        console.log("in js function: sync_logs");

        //post current set of outputs to server
        http://127.0.0.1:8000/SlugIOT_Server/api/device_logs

        for(o in app_device.vue.logs){

            axios.post(app_device.vue.slugIOT_server_url+"device_logs", {
                "device_id": app_device.vue.device_id,
                "procedure_id": app_device.vue.logs[o].procedure_id,
                "log_level": app_device.vue.logs[o].log_level,
                "log_message": app_device.vue.logs[o].log_message,
                "time_stamp": app_device.vue.logs[o].time_stamp

            }).then(function (response) {
                console.log(response);
                console.log("post sent successfully");
            });
        }

        // TODO check status of above post requests

        // clear logs table
        axios.get(clear_logs_url).then(function (response) {

            app_device.vue.logs = [];
            console.log("cleared logs:: ")
            console.log(app_device.vue.logs);
            // app_device.vue.outputs_synced = true;
        });


        // add entry to sync_events table
            axios.post(sync_events_url, {
                table_name: "client_logs"
            }).then(function (response) {
                // console.log(response);
                console.log("inserted event into sync table");
            });
    }

    // LOAD OUTPUTS
    app_device.load_outputs = function(){
        console.log("in js function: load_outputs");

        axios.get(load_outputs_url)
        .then(function (response) {
            
            app_device.vue.outputs = app_device.decorate(app_device.enumerate(response.data.rows));
            console.log(app_device.vue.outputs);
        });
    }


    app_device.sync_outputs = function(){
        console.log("in js function: sync_outputs");
        // o_url =  slugIOT_server_url + app_device.vue.device_id;

        //post current set of outputs to server
        http://127.0.0.1:8000/SlugIOT_Server/api/device_outputs

        for(o in app_device.vue.outputs){

            // console.log("o.time_stamp: " +  app_device.vue.outputs[o].description);

            axios.post(app_device.vue.slugIOT_server_url+"device_outputs", {
                "device_id": app_device.vue.device_id,
                "procedure_id": app_device.vue.outputs[o].procedure_id,
                "field_name": app_device.vue.outputs[o].field_name,
                "description": app_device.vue.outputs[o].description,
                "output_value": app_device.vue.outputs[o].output_value,
                "comments": app_device.vue.outputs[o].comments,
                "tag": app_device.vue.outputs[o].tag,
                "time_stamp": app_device.vue.outputs[o].time_stamp

            }).then(function (response) {
                console.log(response);
                console.log("post sent successfully");
            });
        }

        // TODO check status of above post requests

        // clear output table
        axios.get(clear_outputs_url).then(function (response) {

            app_device.vue.outputs = [];
            console.log("cleared outputs:: ")
            console.log(app_device.vue.outputs);
            // app_device.vue.outputs_synced = true;
        });


        // add entry to sync_events table
            axios.post(sync_events_url, {
                table_name: "client_outputs"
            }).then(function (response) {
                // console.log(response);
                console.log("inserted event into sync table");
            });
    }


    // We form the dictionary of all methods, so we can assign them
    // to the Vue app in a single blow.
    app_device.methods = {
        reset_form: app_device.reset_form,
        get_device_details: app_device.get_device_details,
        sync_outputs: app_device.sync_outputs,
        sync_logs: app_device.sync_logs

    };

    // This creates the Vue instance.
    app_device.vue = new Vue({
        el: "#vue-target-device1",
        data: app_device.data,
        methods: app_device.methods
    });

    // initialization: 
    // generally a network call to the server to load data
    app_device.init = () => {
    };

    // Call to the initializer.
    app_device.init();
};


// This takes the (empty) app object, and initializes it,
init(app_device);




    // app_device.add_procedure = function () {
    //     axios.post(add_proc_url, {
    //             device_id: app_device.vue.device_id,
    //             procedure_name: app_device.vue.procedure_name,

    //         }).then(function (response) {
    //         app_device.vue.rows.push({
    //             id: response.data.id,
    //             device_id: app_device.vue.device_id,
    //             procedure_name: app_device.vue.procedure_name,
    //             _state: {device_id: "clean", procedure_name: "clean"},
    //         });
    //         app_device.enumerate(app_device.vue.rows);
    //         app_device.reset_form();
    //         app_device.set_add_status(false);
    //     });
    // };





            // "device_id": o.device_id,
            // "field_name": o.field_name,
            // "description": o.description,
            // "output_value": o.output_value,
            // "comments": o.comments,
            // "tag": o.tag,
            // "time_stamp":o.time_stamp
        //         "device_id": app_device.vue.device_id,
        //         "procedure_id": app_device.vue.outputs[o].procedure_id,
        //         "field_name": app_device.vue.outputs[o].field_name,
        //         "description": app_device.vue.outputs[o].description,
        //         "output_value": app_device.vue.outputs[o].output_value,
        //         "comments": app_device.vue.outputs[o].comments,
        //         "tag": app_device.vue.outputs[o].tag,
        //         "time_stamp": app_device.vue.outputs[o].time_stamp




