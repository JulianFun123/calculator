String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

const client = new PrajaxClient({
    options: {
        header: {
            "Authorization": "Bearer "+localStorage["session"]
        },
        json: true
    }
})

function calcAll(){
    $("#preview").html("")
    $("#errInfo").html("")
    let previousLines = `
            function log(a) {
                return Math.log(a)
            }

            function cos(a) { return Math.cos(a) }
            function acos(a) { return Math.acos(a) }
            function tan(a) { return Math.tan(a) }
            function atan(a) { return Math.atan(a) }
            function sin(a) { return Math.sin(a) }
            function asin(a) { return Math.asin(a) }

            pi = Math.PI
            π = Math.PI
            `;
    let lastResult = null
    let lines = 0
    let errors = 0
    for (let line of $("#input").val().split("\n")) {
        lines++
        const lineInfo = $n("span").html("&nbsp;")
        $("#errInfo").append(lineInfo)
        if (line.trim().endsWith("\\") ) {
            console.log(line.replaceAt(line.length-1, " ")+"\n")
            previousLines += line.replaceAt(line.length-1, " ")+"\n"
            $("#preview").html($("#preview").html()+"<br>")
        } else {
            try {
                if (line.trim() != '' && !line.trim().startsWith("//") && !line.trim().startsWith("/*")) {
                    // let ans = eval((previousLines+line).replaceAll('^', '**'))

                    // console.log("let ans = "+ans+"\n"+(previousLines+line).replaceAll('^', '**'));

                    const trimmedLine = line.trim()

                    if (lastResult !== null) {
                        if (trimmedLine.startsWith("+")
                            || trimmedLine.startsWith("-")
                            || trimmedLine.startsWith("/")
                            || trimmedLine.startsWith("*")
                            || trimmedLine.startsWith("^")
                        ) {
                            line = lastResult+" "+line
                        }
                        // console.log(line);
                    }
                    lastResult = eval("\n"+(previousLines+line).replaceAll('^', '**'))
                    $("#preview").html($("#preview").html()+lastResult+"<br>")
                    previousLines += ""+line+"\n"
                } else {
                    $("#preview").html($("#preview").html()+"<br>")
                }
            } catch(e) {
                $("#preview").html($("#preview").html()+"<i style='color: #00000022'>Error: "+e.message+"</i><br>")
                lineInfo.addClass('error').attr("title", e.message)
                errors++
            }
        }
    }

    $("#errors").text("Errors: "+errors)
    $("#lines").text("Lines: "+lines)
}

let loggedIn = false
let currentId = null
let currentTitle = "Untitled"
let originalContents = ""
let hasChanges = false

function newEmpty(contents = "// Welcome to this awesome calculator!\n9+6\n3^3\nx = 99\n99+x\n\nlog(44+x)\n\n1+1 // Comment: This adds 1 to 1\na+4 // Causes an error\n\n// Multiline (Experimental)\n6+6\n + 4\n / 4\n - 2\n * 2"){
    currentId = null
    currentTitle = "Untitled"
    originalContents = contents
    $("#input").val(contents)
    $("#title-input").val("Untitled")
    updateTitle()
    calcAll()
}

function loadCalc(id){

    client.get("/api/v1/calculation/"+id)
        .then(res=>res.json())
        .then(res=>{
            if (res.success) {
                currentId = res.id
                currentTitle = res.title
                originalContents = res.contents
                $("#input").val(res.contents)
                $("#title-input").val(res.title)
                updateTitle()
                calcAll()
            }
        })
}

function updateLogin(){
    client.get("/api/v1/user")
        .then(res=>res.json())
        .then(res=>{
            loggedIn = res.success
            if (res.success) {
                $("#menu #profile").removeClass("disabled")
                $(".profile-picture").attr("src", res.avatar)
                $(".name").text(res.name)

                $("#calc-list").html("")

                for (const item of res.calculations) {
                    $("#calc-list").append(
                        $n("div").addClass("entry").append(
                            $n("span").addClass("date").text(item.updated_at)
                        ).append(
                            $n("h1").text(item.title)
                        ).click(()=>{
                            loadCalc(item.id)
                            window.location.hash = item.id
                            $("#sidenav").hide()
                        })
                    )
                }
                $("#calc-list").append(
                    $n("div").addClass("entry").append(
                        $n("h1").text("Create")
                    ).click(()=>{
                        newEmpty()
                        $("#sidenav").hide()
                    })
                )
            } else {
                $("#menu #profile").addClass("disabled")
                $("#menu #profile span").text("Log in")
            }
        })
}

function updateTitle(){
    $("#current-file")
        .text(currentTitle+(hasChanges ? "*":""))
        .css({
            "fontWeight": hasChanges ? 700 : 600
        })

}

function save(){
    const data = {
        title: $("#title-input").val(),
        content: $("#input").val()
    }

    currentTitle = $("#title-input").val()

    if (currentId) {
        client.put("/api/v1/calculation/"+currentId, data)
            .then(res=>res.json())
            .then(res=>{
                if (res.success) {
                    hasChanges = false
                    originalContents = $("#input").val()
                    updateTitle()
                    updateLogin()
                }
            })
    } else {
        client.post("/api/v1/calculation", data)
            .then(res=>res.json())
            .then(res=>{
                if (res.success) {
                    window.location.hash = res.id
                    loadCalc(res.id)
                    updateTitle()
                    updateLogin()
                }
            })
    }
}

$(document).ready(function(){
    calcAll()
    $("#input").keyup(function(e){
        calcAll()

        $("#input").getFirstElement().style.height = $("#input").getFirstElement().scrollHeight+"px"
        console.log(e.keycode);
        if (e.keycode) {
            window.scrollTo(0,document.body.scrollHeight);
        }
        localStorage["saveState"] = $("#input").val()

        hasChanges = $("#input").val() != originalContents
        updateTitle()
    }).val(localStorage["saveState"])
    calcAll()
    $("#input").getFirstElement().style.height = $("#input").getFirstElement().scrollHeight+"px"

    $("#sidenav").hide()
    $("#current-calc").hide()

    $("#close-current-calc-menu").click(()=>{
        $("#current-calc").hide()
    })

    $("#current-file").click(()=>{
        $("#current-calc").toggle()
    })

    $("#save-button").click(()=>{
        save()
        $("#current-calc").hide()
    })

    $("#delete-button").click(()=>{
        client.delete("/api/v1/calculation/"+currentId)
            .then(res=>res.json())
            .then(res => {
                if (res.success) {
                    hasChanges = true
                    $("#sidenav").show()
                    newEmpty()
                    updateTitle()
                    $("#current-calc").hide()
                    updateLogin()
                }
            })
    })

    $("#sidenav").click(()=>{
        $("#sidenav").hide()
    })

    $("#sidenav-contents").click((e)=>{
        e.preventDefault()
        e.stopPropagation()
    })

    $("#profile").click(function () {
        if (loggedIn) {
            $("#sidenav").show()
        } else
            window.location = "/authorization/oauth2/interaapps"
    })

    updateLogin()

    if (window.location.hash)
        loadCalc(window.location.hash.replaceAll("#", ""))
    else
        newEmpty()
    window.addEventListener("hashchange", function(){
        if (window.location.hash)
            loadCalc(window.location.hash.replaceAll("#", ""))
        else
            newEmpty()
    })

    $("#input").keydown((e)=>{
        if (e.ctrlKey && e.key == 's') {
            save()
            e.preventDefault()
        }
    })

    updateTitle()
})