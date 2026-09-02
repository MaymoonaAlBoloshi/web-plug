export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const origin = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
  const script = `(function(){
  var current=document.currentScript;
  var slug=current&&current.getAttribute('data-bot');
  var language=current&&current.getAttribute('data-language')||document.documentElement.lang||'en';
  if(!slug||document.getElementById('webplug-widget'))return;
  var frame=document.createElement('iframe');
  frame.id='webplug-widget';
  frame.title='Website assistant';
  frame.src='${origin}/embed/'+encodeURIComponent(slug)+'?lang='+encodeURIComponent(language==='ar'?'ar':'en');
  frame.allow='clipboard-write';
  frame.style.cssText='position:fixed;right:10px;bottom:10px;width:90px;height:90px;border:0;background:transparent;z-index:2147482999;';
  document.body.appendChild(frame);
  window.addEventListener('message',function(event){
    if(event.origin!=='${origin}'||!event.data||event.data.type!=='webplug:state')return;
    var open=!!event.data.open; var left=event.data.position==='bottom-left';
    frame.style.width=open?'420px':'90px'; frame.style.height=open?'700px':'90px';
    frame.style.maxWidth='100vw'; frame.style.maxHeight='100vh';
    frame.style.left=left?'10px':'auto'; frame.style.right=left?'auto':'10px';
  });
})();`;
  return new Response(script, { headers: { "content-type": "application/javascript; charset=utf-8", "cache-control": "public, max-age=300", "access-control-allow-origin": "*" } });
}
