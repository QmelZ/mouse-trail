const float = (f) => new java.lang.Float(parseFloat(f));

Core.settings.defaults(
    "mouse-trail.length", float(12),
    "mouse-trail.width", float(2),
    "mouse-trail.bloom", true,
    "mouse-trail.rainbow", false,
    "mouse-trail.color", "ffffff"
);

/*
Core.settings.put("mouse-trail.length", float(12));
Core.settings.put("mouse-trail.width", float(2));
Core.settings.put("mouse-trail.bloom", true);
Core.settings.put("mouse-trail.rainbow", false);
Core.settings.put("mouse-trail.color", "ffffff");
*/

const trail = extend(Trail, 120, {
    update(x, y){
        this.super$update(x, y);
        this.length = Core.settings.getFloat("mouse-trail.length");
    }
});

const effect = new Effect(1, e => {
    let layer = Core.settings.getBool("mouse-trail.bloom") ? 0 : 0.1;
    layer = Core.settings.getBool("mouse-trail.rainbow") ? 0.1 : layer;
    Draw.z(Layer.effect + layer);
    
    let color;
    if(Core.settings.getBool("mouse-trail.rainbow")){
        color = Tmp.c1.set(Color.red).shiftHue(Time.time);
    }else{
        try{
            color = Color.valueOf(Core.settings.getString("mouse-trail.color"));
        }catch(c){
            color = Color.black;
        }
    }
    
    trail.draw(color, Core.settings.getFloat("mouse-trail.width"));
});

function menu(){
    const dialog = new BaseDialog("mouse trail");
    dialog.addCloseButton();
    
    let length = float(Core.settings.getFloat("mouse-trail.length"));
    let width = float(Core.settings.getFloat("mouse-trail.width"));
    let color = Core.settings.getString("mouse-trail.color");
    
    dialog.cont.center().pane(p => {
        p.defaults().height(36).left();
        
        p.table(cons(t => {
            p.label(() => "length:");
            p.field(
                length,
                TextField.TextFieldFilter.floatsOnly,
                t => length = t
            );
        }));
        p.row();
        
        p.table(cons(t => {
            p.label(() => "width:");
            p.field(
                width,
                TextField.TextFieldFilter.floatsOnly,
                t => width = t
            );
        }));
        p.row();
        
        p.table(cons(t => {
            p.label(() => "color:");
            p.field(
                color,
                t => color = t
            ).update(e => e.setDisabled(Core.settings.getBool("mouse-trail.rainbow")));
        }));
        p.row();
        
        p.check(
            "bloom",
            Core.settings.getBool("mouse-trail.bloom"),
            b => Core.settings.put("mouse-trail.bloom", b)
        ).update(e => e.setDisabled(Core.settings.getBool("mouse-trail.rainbow")));
        p.row();
        
        p.check(
            "rainbow",
            Core.settings.getBool("mouse-trail.rainbow"),
            b => Core.settings.put("mouse-trail.rainbow", b)
        );
        p.row();
        
    }).growY().width(Vars.mobile ? Core.graphics.getWidth() : Core.graphics.getWidth()/3);
    
    dialog.hidden(() => {
        Core.settings.put("mouse-trail.length", float(length));
        Core.settings.put("mouse-trail.width", float(width));
        Core.settings.put("mouse-trail.color", color);
    });
    
    return dialog;
}

Events.on(ClientLoadEvent, () => {
    Vars.ui.settings.shown(() => {
        Vars.ui.settings.children.get(1).children.get(0).children.get(0).row();
        Vars.ui.settings.children.get(1).children.get(0).children.get(0).button("Mouse Trail", Styles.cleart, () => {
            menu().show();
            Vars.ui.settings.hide();
        });
    });
    
    Events.run(Trigger.update, () => {
        if(Vars.state.is(GameState.State.paused)) return;
        try{
            trail.update(Core.input.mouseWorld().x, Core.input.mouseWorld().y);
            effect.at(Vars.player.x, Vars.player.y)
        }catch(ignored){}
    });
});
