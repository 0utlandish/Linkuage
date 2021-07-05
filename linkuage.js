
/**
 * Copyright (c) 2020
 *
 * @summary create Linkuage namespace and store configuration for environment
 * @author somebie <soomebie@gmail.com>
 *
 */

const Linkuage 	= {};

// flow states
Linkuage.running 	= false;
Linkuage.pause 	= false;

// store all Start blocks
Linkuage.starts 	= [];

// store all blocks
Linkuage.blocks 	= [];

// debuge mode
Linkuage.debuge 	= true;

// Linkuage UI configuration
Linkuage.config = {
	Theme					: '#2ecc71',
	BlockBorderWidth		: 0.3, 	// in pixel
	BlockLabelHPadding		: 5,  	// in tile
    BlockLabelVPadding      : 1,    // in tile
	BlockFillColor			: '#fff',
	BlockStrokeColor		: '#000',
	BlockFont				: {
        Size: '10', // in pixel
        Name: 'Recursive',
        Color: '#000'
    },
	WireWidth				: .4,	// in pixel
	WireColor				: '#212121',
	WireArrowSize			: 5,
	NodeRadius 				: 3,
	GridScale			    : 12,	// in pixel
    GridLineWidth           : 0.1,  // in pixel
	GridLineColor			: '#000',
	FlowDelay 				: 0,
	KeyBinding 				: {
		'Space'		: 'RunPauseToggle',
		'Escape'	: 'Stop',
		'Backquote'	: 'OpenBlocksList'
	}
}

export default Linkuage;