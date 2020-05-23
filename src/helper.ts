import Modal, {ModalProperties} from './index';

let modalRef: Modal | null = null;

export function setModalRef(ref: Modal) {
    modalRef = ref;
}

export function openModal(properties: ModalProperties) {
    if (modalRef) {
        modalRef.open(properties).then();
    }
}

export function closeModal() {
    if (modalRef) {
        modalRef.close().then();
    }
}
