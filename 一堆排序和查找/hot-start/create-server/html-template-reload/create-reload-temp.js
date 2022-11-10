const createReloadTemp = (connectUrl) => `
<script defer>
    const ws = new WebSocket("${connectUrl}");
    ws.onmessage = (msgStr) => {
        const msg = JSON.parse(msgStr.data);
        if(msg.type === 'reload') {
            location.reload()
        }
    }
    ws.onopen = () => { ws.send('pong') };
</script>
`

module.exports = createReloadTemp;
