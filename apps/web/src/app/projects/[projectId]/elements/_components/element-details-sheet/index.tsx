"use client";

import { ElementDetailsAddReferenceModal } from "./add-reference-dialog";
import { ElementDetailsProvider } from "./context";
import { ElementDetailsFormActions } from "./form-actions";
import { ElementDetailsHeader } from "./header";
import { ElementDetailsReferenceImageDetails } from "./image-details-dialog";
import { ElementDetailsMetadataForm } from "./metadata-form";
import { ElementDetailsReferenceGallery } from "./reference-gallery";
import { ElementDetailsRoot } from "./root";
import { ElementDetailsSheetProps } from "./types";

export function ElementDetailsSheet({
  element,
  onClose,
}: ElementDetailsSheetProps) {
  return (
    <ElementDetailsProvider element={element} onClose={onClose}>
      <ElementDetailsRoot>
        <ElementDetailsHeader />
        <div className="space-y-8 pb-12">
          <div className="space-y-6">
            <ElementDetailsMetadataForm />
            <ElementDetailsFormActions />
          </div>
          <ElementDetailsReferenceGallery />
        </div>
      </ElementDetailsRoot>
      <ElementDetailsReferenceImageDetails />
      <ElementDetailsAddReferenceModal />
    </ElementDetailsProvider>
  );
}
