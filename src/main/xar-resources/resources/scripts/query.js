$(document).on("ready", function() {

    function search() {
        const data = $("#fun-query-form").serialize();
        $.ajax({
            type: "POST",
            url: "ajax.html",
            data: data + "&action=search",
            success: function (data) {
                $("#results").fadeOut(100, function() {
                    $(this).html(data);
                    $(this).fadeIn(100, function() {
                        Prism.highlightAll()
                    });
                    timeout = null;
                });
            }
        });
    }

    function reindexIfLoggedIn(ev) {
        ev.preventDefault();

        $.ajax({
            url: "login",
            dataType: "json",
            success: reindex,
            error: function () {
                $("#loginDialog").modal("show");
            }
        });
    }

    function reindex() {
        $("#messages").empty();
        $("#f-load-indicator").show();
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "modules/reindex.xql",
            success: function (data) {
                $("#f-load-indicator").hide();
                if (data.status == "failed") {
                    $("#messages").text(data.message);
                } else {
                    window.location.href = ".";
                }
            }
        });
    }

    let timeout = 0;
    const loginDialog = $("#loginDialog");
    loginDialog.modal({
        show: false
    });
    $("form", loginDialog).on("submit", function(ev) {
        const params = $(this).serialize();
        $.ajax({
            url: "login",
            data: params,
            dataType: "json",
            success: function(data) {
                loginDialog.modal("hide");
                reindex();
            },
            error: function(xhr, textStatus) {
                $(".login-message", loginDialog).show().text("Login failed!");
            }
        });
        return false;
    });
    $("#f-load-indicator").hide();
    $("#query-field").on("keyup", function() {
        const val = $(this).val();
        if (val.length > 3) {
            if (timeout)
                clearTimeout(timeout);
            timeout = setTimeout(search, 300);
        }
    });
    
    $("#f-btn-reindex").on("click", reindexIfLoggedIn);
    $("#f-btn-reindex-regen").on("click", reindexIfLoggedIn);

    $("#fun-query-form *[data-toggle='tooltip']").tooltip();

    // replace markdown element content with rendered HTML
    const mdContentElement = document.querySelector(".markdown")
    if (mdContentElement) {
        const markdown = marked(mdContentElement.textContent)
        mdContentElement.innerHTML = markdown    
    }
});