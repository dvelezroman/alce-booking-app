export const modalInitializer = (): ModalDto => {
  return ({
    show: false,
    message: '',
    isError: false,
    isSuccess: false,
    isInfo: false,
    isContentViewer: false,
    isMetadataViewer: false,
    title: '',
    close: () => {},
    confirm: () => {}
  })
}

export interface ModalDto {
  show: boolean;
  message: string;
  isError: boolean;
  isSuccess: boolean;
  isInfo: boolean;
  isContentViewer?: boolean;
  isMetadataViewer?: boolean;
  metadata?: any;
  title?: string;
  showButtons?: boolean;
  close: () => void;
  confirm?: () => void;
}
