### Install
```
npm install @anvilapp/react-native-modal --save
```
or
```
yarn add @anvilapp/react-native-modal
```

### Usage example
```jsx
import Modal, {AnimationTypes, ComposingTypes} from '@anvilapp/react-native-modal';

const modalRef = React.createRef();

<Modal
    ref={this.modalRef}
    overlayColor="#fff"
    showOverlayDuration={150}
    showContentDuration={150}
    hideOverlayDuration={150}
    hideContentDuration={150}
    showComposingType={ComposingTypes.PARALLEL}
    showAnimationType={[AnimationTypes.SLIDE_UP]}
    hideAnimationType={[AnimationTypes.SLIDE_UP]}
    onOverlayPress={() => modalRef.current.close()}
    onBackButtonPress={() => modalRef.current.close()}
/>

// Open modal
modalRef.current.open({
    render: () => {
        // Use any of your components.
        return <Alert title="Alert title" text="Alert text"/>;
    },
    // ...props
});
```
