$.ajaxSetup({
    beforeSend: function beforeSend(xhr, settings) {
        function getCookie(name) {
            let cookieValue = null;


            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');

                for (let i = 0; i < cookies.length; i += 1) {
                    const cookie = jQuery.trim(cookies[i]);

                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) === (`${name}=`)) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }

            return cookieValue;
        }

        if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
            // Only send the token to relative URLs i.e. locally.
            xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        }
    },
});

$(document).on("click", ".js-toggle-modal", function(e) {
    e.preventDefault()    
    $(".js-modal").toggleClass("hidden")
})
.on("click", ".js-submit", function(e) {
    e.preventDefault()
    console.log("Submit me?")
    const text = $(".js-post-text").val().trim()
    const $btn = $(this)

    if(!text.length) {
        return false
    }   
    

    $btn.prop("disabled", true).text("Posting")
    $.ajax({
        type: 'POST',
        url: $(".js-post-text").data("post-url"),
        data: {
            text: text
        },
        success: (dataHTML) => {
            $(".js-modal").addClass("hidden");
            $("#posts-container").prepend(dataHTML);
            $btn.prop("disabled", false).text("New Post");
            $(".js-post-text").val('')            
        },
        error: (error) => {
            console.warn(error)
            $btn.prop("disabled", false).text("Error");
        }
    });
})
.on("click", ".js-follow", function(e) {
    e.preventDefault();
    console.log("Clicked");

    $.ajax({
        type: 'POST',
        url: $(this).data("url"),
        data: {
            action: $(this).attr("data-action"),
            username: $(this).data("username"),
        },
        success: (data) => {
            console.log("AJAX success: ", data);
            $(".js-follow-text").text(data.wording);
            const $btn = $(this);            
            const newAction = data.wording === "unfollow" ? "unfollow" : "follow";
            $btn.attr("data-action", newAction);
        },
        error: (error) => {
            console.log("AJAX error: ", error);            
        }
    });
});

