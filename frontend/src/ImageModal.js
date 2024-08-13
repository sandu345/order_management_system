// src/components/ImageModal.js
import React from 'react';
import './styles/ImageModal.css';

function ImageModal({ images, isOpen, onClose }) {
    if (!isOpen) return null;
  
    return (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          {images.map((img, index) => (
            <img key={index} src={img} alt={`Order image ${index + 1}`} />
          ))}
        </div>
      </div>
    );
  }

export default ImageModal;
