RESOURCES:

1. Luca's free videos on py4web
2. Free Bulma template from: https://bulmatemplates.github.io/bulma-templates/templates/admin.html
3. Auth: https://github.com/web2py/py4web/blob/master/docs/chapter-13.rst


// TODO:
-check if can send only new logs to server
- check if 'output_synced' table to hold old data needed?
- can remove for loop to sync output table?
- bring all common variables in js (urls, tablenames) to another config file 
<!-- <script>    
    let fetch_device_url = "[[=XML(fetch_device_url)]]";
</script> -->

FUNCTIONS OF CLIENT:
(methods in client controller)

1. user login
2. enter device ID, if not there, ask to go register @ server, if present redirect to below:
3. fetch all device details: 
    - procedures
            get_latest_procedure from server
            install latest_procedure
    - outputs
            store output in local db
            post output to server
    - logs 
            store errors in logs
            send logs to server


(optional)
get settings from server
