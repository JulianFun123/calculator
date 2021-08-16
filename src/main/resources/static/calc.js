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


const FORMULAS = {
    "Satz des Pythagoras": "sqrt(a^2 + b^2)",
    "Satz des Pythagoras (Mit Hypotenuse)": "sqrt(c^2 - a^2)",
    "Flächeninhalt eines Quadrates": "a^2",
    "Flächeninhalt eines Dreiecks": "a * h / 2",
    "Flächeninhalt eines Rechtecks": "a * b",
    "Flächeninhalt eines Trapezes": "(a+c) * h / 2",
    "Flächeninhalt eines Kreises": "r^2*pi",
    "Flächeninhalt eines Kreissektors": "(r^2*pi*a) / 360",

    "Umfang eines Quadrates": "4*a",
    "Umfang eines Rechtecks": "2*(a+b)",
    "Umfang eines Kreissektors": "2*r + b",

    "Volumen eines Quaders":  "a * b * c",
    "Volumen einer Pyramide": "(G*h) / 3",

    "Zufällige Zahl (0-1)": "rand()",
    "Zufällige ganze Zahl": "randInt(a, b)",

    "cosinus": "cos(x)",
    "tanges": "tan(x)",
    "sinus": "sin(x)",

    "arctangens (tan⁻¹)": "atan(x)",
    "arckosinus (cos⁻¹)": "acos(x)",
    "arcsinus (sin⁻¹)": "asin(x)",

    "pi (Symbol)": "π",
    "pi": "pi",

    "Wurzel (√)": "sqrt(x)"
}

function calcAll(){
    $("#preview").html("")
    $("#errInfo").html("")
    let previousLines = `
            function log(a) {
                return Math.log(a)
            }
            
            function cos(a) { return Math.cos(a * Math.PI / 180 ) }
            function acos(a) { return Math.acos(a)*180/Math.PI }
            function tan(a) { return Math.tan(a * Math.PI / 180 ) }
            function atan(a) { return Math.atan(a)*180/Math.PI }
            function sin(a) { return Math.sin(a * Math.PI / 180 ) }
            function asin(a) { return Math.asin(a)*180/Math.PI }
            function round(a) { return Math.round(a) }
            function floor(a) { return Math.floor(a) }
            function min(a,b) { return Math.min(a,b) }
            function max(a,b) { return Math.max(a,b) }
            function rand() { return Math.random() }
            function randInt(min = 0, max = 1) { return Math.floor(Math.random() * max + min) }
            function sqrt(a) { return Math.sqrt(a) }
            function wurzel(a) { return Math.sqrt(a) }
            
            
            pi = Math.PI
            π = Math.PI
            E = Math.E
            ;
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

                    if (trimmedLine.startsWith("(")) {
                        line =  "; "+line;
                    }

                    lastResult = eval("\n"+(previousLines+line)
                        .replaceAll('^', '**')
                        .replaceAll('¹', '**1')
                        .replaceAll('²', '**2')
                        .replaceAll('³', '**3')
                        .replaceAll('⁴', '**4')
                        .replaceAll('⁵', '**5')
                        .replaceAll('⁶', '**6')
                        .replaceAll('⁷', '**7')
                        .replaceAll('⁸', '**8')
                        .replaceAll('⁹', '**9')
                    )

                    const currentResult = lastResult

                    if (typeof currentResult == 'function') {
                        const popup = $n("div").css({
                            'padding': '10px',
                            'background': '#FFF',
                            position: 'absolute',
                            'border': '#00000011 solid 2px',
                            'border-radius': '14px'
                        }).hide()

                        //.hide()
                        const canvasEl = $n("canvas")
                        canvasEl.getFirstElement().width = 100
                        canvasEl.getFirstElement().height = 100
                        popup.append(canvasEl)

                        $("#preview")
                            .append(
                                $n("a").text("draw")
                                    .css({
                                        background: "#00000011",
                                        'border-radius': "5px",
                                        padding: "1px 4px",
                                        'margin-right': '10px',
                                        'font-size': "20px",
                                        'vertical-align': 'middle',
                                        'cursor': "pointer"
                                    })
                                    .click(()=>{
                                        popup.toggle()
                                        const canvas = canvasEl.getFirstElement().getContext("2d")
                                        let lastLine = null
                                        canvas.fillStyle = "#00000011"
                                        canvas.fillOpacity = 0.2
                                        canvas.lineWidth=0.5
                                        canvas.moveTo(50,0)
                                        canvas.lineTo(50,100)
                                        canvas.moveTo(0,50)
                                        canvas.lineTo(100,50)
                                        canvas.fillStyle = "#000000"
                                        canvas.fillOpacity = 1
                                        canvas.lineWidth=1
                                        for (let y = -100; y < 100; y++) {
                                            const x = currentResult(y)
                                            //canvas.fillRect(x/2, y+50, 1, 1)
                                            if (lastLine) {
                                                console.log("yee")
                                                canvas.moveTo(y+50, -x+50)
                                                canvas.lineTo(lastLine.y+50, -lastLine.x+50)
                                            }
                                            canvas.stroke();
                                            lastLine = {x, y}
                                        }
                                    })
                            )
                            .append(popup)
                    }

                    $("#preview").getFirstElement().appendChild(document.createTextNode(currentResult))

                    $("#preview").append($n("br"))
                    previousLines += ""+line+"\n"
                } else {
                    $("#preview").append($n("br"))
                }
            } catch(e) {
                $("#preview").append($n("i").css("color", "#00000022").text(e.message))
                $("#preview").append($n("br"))
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
    window.location.hash = ""
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
                $("#current-file").show()
                $("#menu #profile").removeClass("disabled")
                $(".profile-picture").attr("src", res.avatar)
                $(".name").text(res.nick_name)
                $("#sidenav-user-name").text(`Welcome, ${res.nick_name}`)

                $("#calc-list").html("")

                for (const item of res.calculations) {
                    $("#calc-list").append(
                        $n("div").addClass("entry").append(
                            $n("span").addClass("date").text(item.updated_at)
                        ).append(
                            $n("h1").text(item.title)
                        ).append(
                            $n("pre").text(item.contents)
                        ).click(()=>{
                            loadCalc(item.id)
                            window.location.hash = item.id
                            $("#sidenav").hide()
                        })
                    )
                }
                $("#calc-list").append(
                    $n("div").addClass("create-calc")
                        .html(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16"><path d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z"/></svg>`)
                    .click(()=>{
                        newEmpty()
                        $("#sidenav").hide()
                    })
                )
            } else {
                $("#current-file").hide()
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

function setTheme(mode) {
    $("#darkmode").hide()
    $("#lightmode").hide()

    if (mode == 'darkmode') {
        document.documentElement.style.setProperty('--text-color', "#FFFFFF");
        document.documentElement.style.setProperty('--background-color', "#262b39");
        document.documentElement.style.setProperty('--foreground-color', "#212531");

        $("#darkmode").show()
    } else {
        document.documentElement.style.setProperty('--text-color', "#323232");
        document.documentElement.style.setProperty('--background-color', "#FFFFFF");
        document.documentElement.style.setProperty('--foreground-color', "#F9F9F9");

        $("#lightmode").show()
    }
}

function updateHeight(jumpToBottom = false){
    $("#input").getFirstElement().style.height = "1px"
    $("#input").getFirstElement().style.height = $("#input").getFirstElement().scrollHeight+"px"
    if (jumpToBottom)
        window.scrollTo(0,document.body.scrollHeight);

}

function renderFormularList() {
    const search = $("#formula-search").val().toLowerCase().replaceAll(" ", "")
    $("#formulas-list .entries").html("")
    for (const formular in FORMULAS) {
        if (
            formular.toLowerCase().replaceAll(" ", "").includes(search) ||
            FORMULAS[formular].toLowerCase().replaceAll(" ", "").includes(search)
        ) {
            $("#formulas-list .entries").append(
                $n("div").addClass("entry")
                    .append($n("h1").text(formular))
                    .append($n("pre").text(FORMULAS[formular]))
                    .click(() => {
                        $("#input").val($("#input").val() + "\n\n" + FORMULAS[formular])
                        updateHeight(true)
                        calcAll()
                        $("#formulas-list").hide()
                    })
            )
        }
    }
}

$(document).ready(function(){
    calcAll()
    $("#input").on("input", function(e){
        calcAll()

        updateHeight(e.keyCode == 13)

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
        $("#formulas-list").hide()
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

    $("#close-button").click(()=>{
        $("#sidenav").hide()
    })

    $("#sidenav-contents").click((e)=>{
        e.preventDefault()
        e.stopPropagation()
    })

    $("#profile").click(function () {
        if (loggedIn) {
            $("#sidenav").show()
        } else {
            client.get("/oauth/info")
                .then(res => res.json())
                .then(res => {
                    new IAOAuth2(res.client_id)
                        .addScope("user:read")
                        .openInNewWindow("/logging_in.html")
                            .then(res => {
                                client.get("/authorization/oauth2/interaapps/callback", {
                                    code: res.code,
                                    popup: "true"
                                })
                                    .then(res=>res.json())
                                    .then(res => {
                                        console.log(res)
                                        localStorage["session"] = res.session
                                        client.options.header["Authorization"] = "Bearer "+res.session
                                        updateLogin()
                                    })
                            })
                })
            //window.location = "/authorization/oauth2/interaapps"
        }
    })

    if (!localStorage["theme"])
        localStorage["theme"] = "lightmode"

    setTheme(localStorage["theme"])

    $(".darkmode-button").click(function(){
        if (localStorage["theme"] == 'lightmode')
            localStorage["theme"] = 'darkmode'
        else
            localStorage["theme"] = 'lightmode'
        setTheme(localStorage["theme"])
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

    $("#formulas-list").hide()

    renderFormularList()

    $("#formulas").click(()=>{
        $("#current-calc").hide()
        $("#formulas-list").toggle()
    })

    $("#formula-search").keyup(()=>{
        renderFormularList()
    })

    $("#close-formulas-menu").click(function () {
        $("#formulas-list").hide()
    })

    updateTitle()
})
