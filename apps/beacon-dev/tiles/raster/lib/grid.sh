#!/usr/bin/env bash
# Shared grid constants. Source this from other scripts.
export GRID_CRS="EPSG:3857"
export GRID_RES_M=1
export TILE_SIZE=1024
export MAX_ZOOM=17
export MIN_ZOOM=0

# Each tile = 1024 px * 1 m/px ≈ 1 km on the ground (at z17, 0.75 m/px
# actual — closest standard zoom to 1 m at 1024 tile size).
export GRID_TR="$GRID_RES_M $GRID_RES_M"

# Common gdalwarp flags for aligning to the global grid.
# -tap (target-aligned pixels) ensures every output snaps to the
# same global grid regardless of input extent.
# If $BBOX is set (west south east north), clips output to that extent.
grid_warp_flags() {
  local flags="-t_srs $GRID_CRS -tr $GRID_TR -tap -r bilinear -co COMPRESS=DEFLATE -co TILED=YES -co BLOCKXSIZE=512 -co BLOCKYSIZE=512"
  if [ -n "${BBOX:-}" ]; then
    flags="-te $BBOX -te_srs EPSG:4326 $flags"
  fi
  echo "$flags"
}

grid_warp_flags_nearest() {
  local flags="-t_srs $GRID_CRS -tr $GRID_TR -tap -r near -co COMPRESS=DEFLATE -co TILED=YES -co BLOCKXSIZE=512 -co BLOCKYSIZE=512"
  if [ -n "${BBOX:-}" ]; then
    flags="-te $BBOX -te_srs EPSG:4326 $flags"
  fi
  echo "$flags"
}

# Terrain-RGB encode: value → R,G,B.
# value = (R*65536 + G*256 + B) * scale + offset
# To encode: v = (value - offset) / scale; R=v>>16; G=(v>>8)&0xFF; B=v&0xFF
terrain_rgb_encode_expr() {
  local scale="$1" offset="$2"
  echo "v = (A - ($offset)) / ($scale); numpy.stack([v // 65536, (v // 256) % 256, v % 256], axis=-1).astype(numpy.uint8)"
}
