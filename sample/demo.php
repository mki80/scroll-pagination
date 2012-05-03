<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="author" content="">
<meta name="created" content="2012-05-02">
<title>Scroll Pagination</title>
<link rel="stylesheet" href="http://yui.yahooapis.com/3.5.0/build/cssreset/reset-min.css">
<link rel="stylesheet" href="http://yui.yahooapis.com/3.5.0/build/cssfonts/fonts-min.css">
<script type="text/javascript" src="http://yui.yahooapis.com/3.5.0/build/yui/yui-min.js"></script>
<script type="text/javascript" src="../scroll-pagination.js"></script>
<style type="text/css">
#foo .item {
    height: 98px;
    border: solid 1px #ccc;
    border-width: 1px 0;
}
.yui3-scroll-pagination-indicator {
    visibility: hidden;
}
div.yui3-scroll-pagination-loading {
    padding: 10px 10px 10px 30px;
    background: yellow;
    visibility: visible;
}
.yui3-scroll-pagination-click {
    padding: 10px 10px 10px 30px;
    background: pink;
    visibility: visible;
}
.yui3-scroll-pagination-end {
    padding: 10px 10px 10px 30px;
    background: #ccc;
    visibility: visible;
}
</style>
</head>
<body>
    <div id="foo">
<?php for ($i = 0, $j = 20; $i < $j; $i++) : ?>
        <div class="item item-<?php echo $i+1; ?>">.item-<?php echo $i+1; ?></div>
<?php endfor; ?>
    </div>
    <script>
    YUI().use("json-parse", "scroll-pagination", "datasource-io", "datasource-jsonschema", function (Y) {

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

        var page = 1; // For demo purpose.

        scroll.on("load", function (e) {
            var self = this,
                data = e.meta;

            if (data.count >= 160) {
                Y.one("#foo").append(data.html);
                scroll.set("isEnd", true);
                scroll.destroy();

            } else {
                page++;
                self.set("data.request", [
                    "?last_id=" + data.last_id,
                    "&last_timestamp=" + data.last_timestamp,
                    "&page=" + page
                ].join(""));
                Y.one("#foo").append(data.html);
                //if (page >= 5) {
                    //self.set("autoLoad", false);
                //}
            }

        })
    });
    </script>
</body>
</html>
