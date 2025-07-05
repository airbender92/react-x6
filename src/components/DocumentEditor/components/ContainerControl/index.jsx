
const ContainerSubControl = (props) => {

    const {moduleType} = props;
    const [showSide, setShowSide] = React.useState(false);

    const RenderComponent = useMemo(() => {
        switch(moduleType){
            case 'richText':
                return React.lazy(() => import('../RichTextControl'));
            case 'image':
                return React.lazy(() => import('../ImageControl'));
        }
    }, [moduleType]);

    return (
        <div
            onMouseEnter={() => setShowSide(true)}
            onMouseLeave={() => setShowSide(false)}
        >
            <RenderComponent />
            {
                showSide && (<SideTool />)
            }
        </div>
    )
}