Sample Code:

    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <title>Scroll Pagination</title>
    <link rel="stylesheet" href="assets/scroll-pagination.css">
    <script type="text/javascript" src="http://yui.yahooapis.com/3.5.0/build/yui/yui-min.js"></script>
    <script type="text/javascript" src="scroll-pagination.js"></script>
    </head>
    <body>

        <script>
        YUI().use("scroll-pagination", function (Y) {

            var scroll = new Y.ScrollPagination({
                foldDistance: 500,
                delay: 1000,
                data: {
                    source: "ajax.php",
                    schema: {
                        metaFields: {
                            count: "result.count",
                            last_id: "result.last_id",
                            last_timestamp: "result.last_timestamp",
                            html: "result.html"
                        }
                    },
                    request: "?page=1&r=" + parseInt(new Date().getTime(), 10)
                }
            });

            scroll.on("load", function (e) {

                // Set for next request.
                self.set("data.request", [
                    "?last_id=" + data.last_id,
                    "&last_timestamp=" + data.last_timestamp,
                    "&page=" + page
                ].join(""));

                // Inject HTML.
                Y.one("#foo").append(data.html);

            })
        });
        </script>
    </body>
    </html>

