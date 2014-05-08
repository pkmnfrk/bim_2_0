function commafy(n) {
    if(isNaN(n)) n = 0;
    var func = function(n) {
        //if(n == 0) return "0";
        if(n < 0) return "-" + commafy(-n);
        if(n < 1000) return n.toString();
        return commafy(Math.floor(n / 1000)) + "," + sprintf("%03d", commafy(Math.floor(n % 1000)));
    }
    
    var remain = n - Math.floor(n);
    var ret = func(n);
    if(remain) ret += remain.toFixed(2).substr(1);
    
    return ret;
}

BIM = function() {
    
    var costElement = $("#cost .v")[0];
    var roiElement = $("#roi .v")[0];
    
    var setCost = function(cost) {
        this.cost = cost;
        $(costElement).text(commafy(this.cost));
    }
    
    var setRoi = function(roi) {
        this.roi = roi;
        $(roiElement).text(commafy(this.roi));
    }
    
    var addCost = function(cost) {
        this.cost += cost;
        $(costElement).text(commafy(this.cost));
    }
    
    var addRoi = function(cost) {
        this.roi += cost;
        $(roiElement).text(commafy(this.roi));
    }
    
    var addCard = function(card) {
        var li = document.createElement("li");
        $(li)
            .data("card", card)
            .addClass("option")
            .text(card.text);
        
        $("#card-picker ul").append(li);
        
        //$(li).draggable()
        
    }
    var recalculate = function(v) {
        if(typeof v === "undefined") {
            v = $("#effectiveness").slider( "option", "value" );
        }
        
        this.cost = 0;
        this.roi = 0;
        var perc = v / 100;
        
        for(var i = 0; i < inCards.length; i++) {
            var card = $(inCards[i]).data("card");
            
            var base = card.cost[0];
            base = base + (card.cost[1] - base) * perc;
            
            this.cost += base;
            
            base = card.roi[0];
            base = base + (card.roi[1] - base) * perc;
            
            this.roi += base;
        }
        
        setCost(this.cost);
        setRoi(this.roi);
    }
    
    var ret = {
        cost: 0,
        roi: 0,
        setCost: setCost,
        setRoi: setRoi,
        addCost: addCost,
        addRoi: addRoi,
        addCard: addCard,
        recalculate: recalculate
    };
    
    return ret;
    
}();

var inCards = [];

$("#drug")
    .droppable({
        tolerance: "intersect",
        
        over: function(e, ui) {
            
            var el = ui.draggable[0]
            var ob = $(el);
            
            for(var i = 0; i < inCards.length; i++) {
                if(inCards[i] == el) return;
            }
            
            inCards.push(el);
            BIM.recalculate();
        },
        
        drop: function(e, ui) {
            $(ui.draggable).data("in", true);
        },
        
        out: function(e, ui) {
            var el = ui.draggable[0]
            var ob = $(el);
            
            //if(el in inCards) {
            for(var i = 0; i < inCards.length; i++) {
                if(inCards[i] == el) {
                    inCards.splice(i, 1);
                    break;
                }
            }
            
            BIM.recalculate();
                    
            //}
        },
    });

$("#effectiveness").slider({
    min: 0,
    max: 100,
    value: 50,
    slide: function(e, ui) {
        BIM.recalculate(ui.value);
        
    },
    change: function(e, ui) {
        BIM.recalculate(ui.value);
    }
    
});

$("#addCard").click(function(e) {
    $("#card-picker").animate({top: "5%"});
});
$("#doneAddingCard").click(function(e) {
    $("#card-picker").animate({top: "100%"});
});

$("#card-picker").on("click", "li.option", function(e) {
    $(this).toggleClass("selected");
    
    
    if($(this).hasClass("selected")) {
        //add the card
        var copy = $(this)
                        .clone()
                        .removeClass("selected")
                        .removeClass("option")
                        .addClass("moveable")
                        .data("card", $(this).data("card"))
                        [0];
        
        $(this).data("theClone", copy);
        
        $("#cards").append(copy);
        inCards.push(copy);
        
        BIM.recalculate();
        
        $(copy).draggable();
    } else {
        var copy = $(this).data("theClone");
        $(copy).remove();
    }
});

BIM.addCost(0);
BIM.addRoi(0);

for(var i = 0; i < data.effectors.length; i++) {
    BIM.addCard(data.effectors[i]);
}
